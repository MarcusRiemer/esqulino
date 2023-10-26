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
 * subtree according to the parameters defined for the unwrapp pattern.
 *
 * @param parentNode
 * @param matchedNodeLoc
 * @param unwrapPattern
 * TODO: Should return the transformed subtree together with markings for the changes
 * that are relevant for the apply function, in order to determine
 * which matchings have become outdated after the transformation.
 */

export function appendChildGroupsToNodeDescription(
  nodeDesc: NodeDescription,
  children: { [childrenCategory: string]: NodeDescription[] },
  position: "start" | "end"
): NodeDescription {
  // No children present
  if (nodeDesc.children === undefined)  nodeDesc.children = children;
  else {
    // TODO: Appending when there exist children already
    for(let category of Object.keys(children)) {
      // parentNode has this category. 
      // Insert (or append) all children from category in the given position.
        if(nodeDesc.children[category] !== undefined) {
          if(position === "end") nodeDesc.children[category].push(...children[category])
          else nodeDesc.children[category].unshift(...children[category]);
        } 
        else {
      // The category does not already exist on the parent node.
          nodeDesc.children[category] = children[category]
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
  let insertPosition = unwrapPattern.position === undefined ? "start" : unwrapPattern.position;
  let subTree = new SyntaxTree(parentNode.toModel());
  const matchedNode = subTree.locate(matchedNodeLoc);
  // Removing the matched SyntaxNode:
  let tempSubTree = subTree.deleteNode(matchedNodeLoc);

  // Appending the orphaned children to the parentNode
  const newParentNodeDesc = appendChildGroupsToNodeDescription(
    tempSubTree.toModel(),
    matchedNode.toModel().children,
    insertPosition
  );
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
          [loc.pop()],
          tPattern
        );

        let finalTree = tree.replaceNode(
          oldParentNode.location,
          newParentNodeDesc
        );
        // TODO: Validate that the newParentNodeDesc is still grammatically valid
        return finalTree.toModel();
        //After validation:
      }
  }
}

export function replaceTemplates(
  inp: SyntaxTree,
  patterns: string[]
): SyntaxTree {
  return inp;
}
