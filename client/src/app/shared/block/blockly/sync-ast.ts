import {
  NodeDescription,
  NamedLanguages,
  Orientation,
  isNodeOneOfTypeDescription,
  isNodeTypeChildrenGroupDescription,
} from "../../syntaxtree/";
import {
  fromStableQualifiedTypename,
  stableQualifiedTypename,
  allChildTypes,
  resolveToConcreteTypes,
  getNodeAttribute,
} from "../../syntaxtree/grammar-type-util";
import {
  buildAppearanceContext,
  AppearanceContext,
} from "./appearance-context";

// A sequence of statements is encoded as a deeply nested tree in Blockly but
// as a flat list in Blattwerkzeug.
const CHILD_GROUP_NAME_CONTINUATION = "__list__";

function getImmediateChildrenByTagName(parent: Element, ...tagNames: string[]) {
  return Array.from(parent.children).filter((c) =>
    tagNames.includes(c.tagName)
  );
}

export function blocklyToInternal(
  blocklyXml: string | Element
): NodeDescription {
  if (typeof blocklyXml === "string") {
    const parser = new DOMParser();
    blocklyXml = parser.parseFromString(blocklyXml, "text/xml").documentElement;
  }

  let toReturn: NodeDescription;

  const rootBlocks = getImmediateChildrenByTagName(blocklyXml, "block");
  if (rootBlocks.length === 1) {
    toReturn = parseBlock(rootBlocks[0], undefined);
  } else if (rootBlocks.length > 1) {
    throw new Error(`Blockly workspace has ${rootBlocks.length} roots`);
  }

  return toReturn;
}

/**
 * Most value strings can be passed down as is. But boolean values are
 * written in UPPERCASE in Blockly and lowercase in the integrated AST.
 */
function parsePropertyValue(propValue: string) {
  const BOOLEAN_VALUES = ["TRUE", "FALSE"];
  if (BOOLEAN_VALUES.includes(propValue)) {
    return propValue.toLowerCase();
  } else {
    return propValue;
  }
}

function parseBlock(
  blockNode: Element,
  continuationChildGroup: NodeDescription[] | undefined
): NodeDescription {
  const t = fromStableQualifiedTypename(blockNode.getAttribute("type"));

  const toReturn: ReturnType<typeof parseBlock> = {
    language: t.languageName,
    name: t.typeName,
  };

  // Parse all assigned properties
  const properties: NodeDescription["properties"] = {};
  getImmediateChildrenByTagName(blockNode, "field").forEach((f) => {
    properties[f.getAttribute("name")] = parsePropertyValue(f.textContent);
  });

  if (Object.keys(properties).length > 0) {
    toReturn.properties = properties;
  }

  // Parse all assigned children
  const children = getImmediateChildrenByTagName(
    blockNode,
    "value",
    "statement",
    "next"
  );

  if (children.length > 0) {
    toReturn.children = {};
    children.forEach((group) => {
      // The `<next>`-node always uses the continuation, all other
      // types of children might create a new context
      let localContinuation = continuationChildGroup;
      if (group.tagName !== "next") {
        // Find out which group this block should be appended to
        const groupName = group.getAttribute("name");
        // Ensure there is an active continuation if one is required
        if (
          groupName === CHILD_GROUP_NAME_CONTINUATION &&
          !continuationChildGroup
        ) {
          throw new Error(
            "No continuationChildGroup for " + blockNode.outerHTML
          );
        }

        // Possibly assign the new continuation, but keep the existing
        // continuation if there is no other group name assigned
        if (groupName !== CHILD_GROUP_NAME_CONTINUATION) {
          if (!toReturn.children[groupName]) {
            toReturn.children[groupName] = [];
          }
          localContinuation = toReturn.children[groupName];
        }
      }

      const childBlockNode = group.querySelector("block");

      // Parse the child blocks in that group, this will recursively
      // walk down the tree until the end.
      const block = parseBlock(childBlockNode, localContinuation);

      // Put the new block in front of the blocks that have been
      // added during the recursive descent
      localContinuation.unshift(block);
    });

    // Children ob may have been added, but wasn't used due to active
    // continuationChildGroup
    if (Object.keys(toReturn.children).length === 0) {
      delete toReturn.children;
    }
  }

  return toReturn;
}

function createWorkspaceBlock(
  ast: NodeDescription,
  ac: AppearanceContext,
  parent: Element,
  doc: Document
) {
  // Build the block and its properties
  const blockNode = doc.createElement("block");
  blockNode.setAttribute("type", stableQualifiedTypename(ast));
  if (ast.properties) {
    Object.entries(ast.properties).forEach(([key, value]) => {
      const field = doc.createElement("field");
      field.setAttribute("name", key);
      field.textContent = value;
      blockNode.appendChild(field);
    });
  }

  // Place it into the tree
  parent.appendChild(blockNode);

  // We will need to check the grammar type definition for
  // the possible types of children multiple times in the
  // upcoming loop.
  const nodeDesc = ac.types[ast.language][ast.name];
  if (isNodeOneOfTypeDescription(nodeDesc)) {
    return;
  }

  // Possibly build children for this block
  if (ast.children) {
    const typeDesc = ac.types[ast.language][ast.name];
    if (typeDesc.type === "concrete" || typeDesc.type === "visualize") {
      Object.entries(ast.children).forEach(([groupName, children]) => {
        const childGroupDesc = getNodeAttribute(nodeDesc, groupName);

        // The child group should be known to the grammar
        if (!childGroupDesc) {
          throw new Error(
            `Children in unknown childgroup "${groupName}" of tree ${JSON.stringify(
              ast
            )}`
          );
        }

        // And it should be a child group
        if (!isNodeTypeChildrenGroupDescription(childGroupDesc)) {
          throw new Error(
            `Unexpected children of type "${
              childGroupDesc.type
            }" in not-childgroup "${groupName}" of tree ${JSON.stringify(ast)}`
          );
        }

        // Check that all children have the same orientation
        const mentionedTypes = allChildTypes(
          childGroupDesc,
          ast.language
        ).flatMap((t) => resolveToConcreteTypes(t, ac.types));

        const mentionedOrientations = new Set<Orientation>();
        mentionedTypes.forEach((t) => {
          const tO = ac.typeDetails[stableQualifiedTypename(t)]?.orientation;
          // There might not be orientation data about this type. If this
          // happens for every type the following code has a fallback
          if (tO) {
            tO.forEach((t) => mentionedOrientations.add(t));
          }
        });

        // Initially append to the block node, this will be switched later to the newly created nodes
        let parentForContinuation = blockNode;

        // Hopefully all children agree on the same orientation
        if (mentionedOrientations.size <= 1) {
          const orientation =
            mentionedOrientations.size === 1
              ? Array.from(mentionedOrientations)[0]
              : "vertical";
          children.forEach((child) => {
            // The node that serves as the list container.
            let listNode: Element = undefined;

            // The details of the correct list node differ between value and statement blocks.
            if (orientation === "horizontal") {
              listNode = doc.createElement("value");
              // Starting the child group: Use the name of the childgroup
              if (parentForContinuation === blockNode) {
                listNode.setAttribute("name", groupName);
              }
              // Continuing the child group: Use a special attribute name to indicate this
              else {
                listNode.setAttribute("name", CHILD_GROUP_NAME_CONTINUATION);
              }
            } else {
              // Starting the child group: create a statements node with a name
              if (parentForContinuation === blockNode) {
                listNode = doc.createElement("statement");
                listNode.setAttribute("name", groupName);
              }
              // Continuing a child group: use the next node
              else {
                listNode = doc.createElement("next");
              }
            }

            parentForContinuation.appendChild(listNode);

            parentForContinuation = createWorkspaceBlock(
              child,
              ac,
              listNode,
              doc
            );
          });
        } else {
          throw new Error(
            `Impossible: Found orientations ${JSON.stringify(
              Array.from(mentionedOrientations)
            )} for child group ${groupName} in tree ${JSON.stringify(ast)}`
          );
        }
      });
    } else {
      throw new Error(
        `Found virtual typedef node in tree: ${JSON.stringify(ast)}`
      );
    }
  }

  return blockNode;
}

// TODO: Passing in the types via NamedLanguages is probably insufficient,
//       Visualized types will require information from the base grammar.
export function internalToBlockly(
  ast: NodeDescription,
  g: NamedLanguages
): Element {
  const doc = new Document();
  const toReturn = doc.createElement("xml");
  const ac = buildAppearanceContext(g);
  // toReturn.setAttribute("xmlns", "https://developers.google.com/blockly/xml");

  if (ast) {
    createWorkspaceBlock(ast, ac, toReturn, doc);
  }

  return toReturn;
}
