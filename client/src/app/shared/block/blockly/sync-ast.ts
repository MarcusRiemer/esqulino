import {
  GrammarDocument,
  NodeDescription,
  isGrammarDocument,
  NamedLanguages,
  isNodeTypeChildrenGroupDescription,
  Orientation,
} from "../../syntaxtree/";
import {
  fromStableQualifiedTypename,
  stableQualifiedTypename,
  getQualifiedTypes,
  allPresentTypes,
  allChildTypes,
  resolveToConcreteTypes,
} from "../../syntaxtree/grammar-type-util";
import {
  buildAppearanceContext,
  AppearanceContext,
  blockOrientation,
} from "./appearance-context";

// A sequence of statements is encoded as a deeply nested tree in Blockly but
// as a flat list in Blattwerkzeug.
const CHILD_GROUP_NAME_CONTINUATION = "__list__";

function getImmediateChildrenByTagName(parent: Element, ...tagNames: string[]) {
  return Array.from(parent.children).filter((c) =>
    tagNames.includes(c.tagName)
  );
}

export function blocklyToInternal(blocklyXmlString: string): NodeDescription {
  const parser = new DOMParser();
  const blocklyXml = parser.parseFromString(blocklyXmlString, "text/xml");

  let toReturn: NodeDescription;

  const root = blocklyXml.documentElement;
  const rootBlocks = getImmediateChildrenByTagName(root, "block");
  if (rootBlocks.length === 1) {
    toReturn = parseBlock(rootBlocks[0], undefined);
  } else if (rootBlocks.length > 1) {
    throw new Error(`Blockly workspace has ${rootBlocks.length} roots`);
  }

  return toReturn;
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
    properties[f.getAttribute("name")] = f.textContent;
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
  doc: Document
): Element {
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

  // Possibly build children for this block
  if (ast.children) {
    const typeDesc = ac.types[ast.language][ast.name];
    if (typeDesc.type === "concrete" || typeDesc.type === "visualize") {
      Object.entries(ast.children).forEach(([name, children]) => {
        if (isNodeTypeChildrenGroupDescription(children)) {
          // Check that all children have the same orientation
          const mentionedTypes = allChildTypes(
            children,
            ast.language
          ).flatMap((t) => resolveToConcreteTypes(t, ac.types));

          const mentionedOrientations = new Set<Orientation>();
          mentionedTypes.forEach((t) => {
            const tO = ac.typeDetails[stableQualifiedTypename(t)].orientation;
            tO.forEach((t) => mentionedOrientations.add(t));
          });

          // Hopefully all children agree on the same orientation
          if (mentionedOrientations.size == 1) {
            const orientation = Array.from(mentionedOrientations)[0];
            if (orientation === "horizontal") {
            } else {
            }
          } else {
          }
        } else {
          throw new Error(
            `Children in unknown childgroup ${name} of tree ${JSON.stringify(
              ast
            )}`
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

export function internalToBlockly(
  ast: NodeDescription,
  g: NamedLanguages
): Element {
  const doc = new Document();
  const toReturn = doc.createElement("xml");
  const ac = buildAppearanceContext(g);
  // toReturn.setAttribute("xmlns", "https://developers.google.com/blockly/xml");

  if (ast) {
    toReturn.appendChild(createWorkspaceBlock(ast, ac, doc));
  }

  return toReturn;
}
