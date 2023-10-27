import { arrayEqual } from "../util";
import { NodeChildren, locationEquals } from "./syntaxtree";
import {
  NodeDescription,
  NodeLocation,
  SyntaxNode,
  SyntaxTree,
} from "./syntaxtree";
import {
  TransformPattern,
  Selector,
  TransformPatternUnwrap,
} from "./transform.description";
("./transform.description");

/**
 * Takes the parent of a matched syntax node and transform it or its
 * subtree according to the parameters defined for the unwrap pattern.
 *
 * @param parentNode
 * @param matchedNodeLoc
 * @param unwrapPattern
 * TODO: Should return the transformed subtree together with markings for the changes
 * that are relevant for the apply function, in order to determine
 * which matchings have become outdated after the transformation.
 */

export function appendPropertiesToNodeDescription(
  nodeDesc: NodeDescription,
  properties: { [propertyName: string]: string },
  flag: "copy" | "overwrite" | "ignore"
) {
  // Nothing to do.
  if (properties === undefined) return nodeDesc;
  // No properties present
  if (nodeDesc.properties === undefined) nodeDesc.properties = properties;
  else {
    // Appending when there exist properties already
    for (let propertyName of Object.keys(properties)) {
      // parentNode has this property.
      // Append or overwrite all existent properties depending on the flag
      if (nodeDesc.properties[propertyName] !== undefined) {
        if (flag === "copy")
          nodeDesc.properties[propertyName] += properties[propertyName];
        else if (flag === "overwrite")
          nodeDesc.properties[propertyName] = properties[propertyName];
      } else {
        // The category does not already exist on the parent node.
        if (flag !== "ignore")
          nodeDesc.properties[propertyName] = properties[propertyName];
      }
    }
  }

  return nodeDesc;
}

export function appendChildGroupsToNodeDescription(
  nodeDesc: NodeDescription,
  children: { [childrenCategory: string]: NodeDescription[] },
  position: "in-place" | "start" | "end",
  inplaceInsertPosition: number
): NodeDescription {
  // Nothing to do
  if (children === undefined) return nodeDesc;
  // No children present
  if (nodeDesc.children === undefined) nodeDesc.children = children;
  else {
    // Appending when there exist children already
    for (let category of Object.keys(children)) {
      // parentNode has this category.
      // Insert (or append) all children from category in the given position.
      if (nodeDesc.children[category] !== undefined) {
        if (position === "end")
          nodeDesc.children[category].push(...children[category]);
        else if (position === "start")
          nodeDesc.children[category].unshift(...children[category]);
        else if (position === "in-place") {
          if (inplaceInsertPosition === undefined) inplaceInsertPosition = 0;
          let temp = nodeDesc.children[category].splice(
            0,
            inplaceInsertPosition
          );
          temp.push(...children[category]);
          temp.push(
            ...nodeDesc.children[category].splice(inplaceInsertPosition)
          );
          nodeDesc.children[category] = temp;
        }
      } else {
        // The category does not already exist on the parent node.
        nodeDesc.children[category] = children[category];
      }
    }
  }

  return nodeDesc;
}

export function unwrapTransformation(
  parentNode: SyntaxNode,
  matchedNodeLoc: NodeLocation,
  unwrapPattern: TransformPatternUnwrap
): NodeDescription {
  let insertPositionTag =
    unwrapPattern.position === undefined ? "start" : unwrapPattern.position;
  let subTree = new SyntaxTree(parentNode.toModel());
  const matchedNode = subTree.locate(matchedNodeLoc);
  // Removing the matched SyntaxNode:
  let tempSubTree = subTree.deleteNode(matchedNodeLoc);

  // Appending the orphaned children to the parentNode
  let newParentNodeDesc = appendChildGroupsToNodeDescription(
    tempSubTree.toModel(),
    matchedNode.toModel().children,
    insertPositionTag,
    matchedNodeLoc[0][1]
  );

  // Appending the old properties of the original node, if specified
  if (
    unwrapPattern.oldProperties !== undefined &&
    unwrapPattern.oldProperties !== "ignore"
  ) {
    newParentNodeDesc = appendPropertiesToNodeDescription(
      newParentNodeDesc,
      matchedNode.toModel().properties,
      unwrapPattern.oldProperties
    );
  }

  return newParentNodeDesc;
}

/**
 * Takes a syntax tree and a list of patterns as inputs and applies the transformations described by the patterns onto the given inout syntax tree.
 * @param inp Represents the input syntax tree that is to be transformed with the help of the defined patterns
 * @returns The transformed syntax tree for further evaluation and validation against the grammar.
 */

export function applyPatternOnLocation(
  tree: SyntaxTree,
  tPattern: TransformPattern,
  loc: NodeLocation
): NodeDescription {
  switch (tPattern.kind) {
    case "unwrap":
      // Check for root
      if (locationEquals(loc, []))
        throw new Error(
          "Root can not be unwrapped without destroying the tree!"
        );
      else {
        let oldParentNode = tree.locate(loc).nodeParent;
        // Pass the arguments to the unwrapTransformation function, with local path from the parent
        // used to identify the matched node
        let newParentNodeDesc = unwrapTransformation(
          oldParentNode,
          [loc.pop()], // This makes the loation relative to the parentNode
          tPattern
        );

        let finalTree = tree.replaceNode(
          oldParentNode.location,
          newParentNodeDesc
        );
        // TODO: Validate that the newParentNodeDesc is still grammatically valid or delegate this task to the caller funciton.
        return finalTree.toModel();
      }
  }
}

export function replaceTemplates(
  inp: SyntaxTree,
  patterns: string[]
): SyntaxTree {
  return inp;
}
