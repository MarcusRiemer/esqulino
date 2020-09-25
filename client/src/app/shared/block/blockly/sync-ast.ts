import { GrammarDocument, Tree, NodeDescription } from "../../syntaxtree/";
import { fromStableQualifiedTypename } from "../../syntaxtree/grammar-type-util";

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
