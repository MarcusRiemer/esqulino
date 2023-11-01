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
  TransformPatternWrapWith,
  TransformPatternReplace,
} from "./transform.description";
("./transform.description");

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
          //TODO: Exceptions when not sensible?
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
 * Takes a parentNode and the location of a child node and a wrap pattern defined by the user.
 * Transforms the tree by replacing the matched child node on the parent with a new node,
 * created by wrapping the child node with a node defined by the user in the wrapPattern,
 * adding the child node under the childGroup defined by the user.
 * @param parentNode The parent of the node to be wrapped.
 * @param matchedNodeLoc
 * @param wrapPattern
 * @returns
 */

export function wrapTransformation(
  parentNode: SyntaxNode,
  matchedNodeLoc: NodeLocation,
  wrapPattern: TransformPatternWrapWith
): NodeDescription {
  // Create the new Node from the definition given by the user.
  let newNodeDesc = wrapPattern.newNode; // TODO: is undefined check here necessary?
  let newChildGroup = wrapPattern.appendOntoGroup; // TODO: is undefined check here necessary?
  let subTree = new SyntaxTree(parentNode.toModel());
  if (!newNodeDesc.children) newNodeDesc.children = {};
  // Append the matched node as a child of the newNodeDesch under the newChildGroup.
  if (!newNodeDesc.children[newChildGroup])
    newNodeDesc.children[newChildGroup] = [
      subTree.locate(matchedNodeLoc).toModel(),
    ];
  else
    newNodeDesc.children[newChildGroup].push(
      subTree.locate(matchedNodeLoc).toModel()
    );
  // NOTE: Replacing the root is already defined as a special case in the function replaceNode().
  subTree = subTree.replaceNode(matchedNodeLoc, newNodeDesc);
  return subTree.toModel();
}

export function replaceTransformation(
  parentNode: SyntaxNode,
  matchedNodeLoc: NodeLocation,
  replacePattern: TransformPatternReplace
): NodeDescription {
  let newNodeDesc = replacePattern.newNode; // TODO: is undefined check here necessary?
  let subTree = new SyntaxTree(parentNode.toModel());
  let oldNode = subTree.locate(matchedNodeLoc).toModel();
  let newChildren = {};

  // Handle the children
  if (replacePattern.oldChildren === "copy") {
    if (replacePattern.oldChildrenAppendOntoGroup) {
      // The user wants to append all children of the old node under one single childGroup
      let newChildGroupName = replacePattern.oldChildrenAppendOntoGroup;
      newChildren[newChildGroupName] = [];
      if (oldNode.children)
        Object.keys(oldNode.children).forEach((key: string) =>
          newChildren[newChildGroupName].push(...oldNode.children[key])
        );
      if (!newNodeDesc.children) newNodeDesc.children = newChildren;
      else if (newNodeDesc.children[newChildGroupName]) {
        // push to the end if the childgroup already exists on the newNode
        newNodeDesc.children[newChildGroupName].push(
          ...newChildren[newChildGroupName]
        );
      } else {
        //Add a new childgroup
        newNodeDesc.children[newChildGroupName] =
          newChildren[newChildGroupName];
      }
    } else {
      //Just do a normal append at the end
      newNodeDesc = appendChildGroupsToNodeDescription(
        newNodeDesc,
        oldNode.children,
        "end",
        -1
      );
    }
  }

  // Handle the properties
  if (replacePattern.oldProperties) {
    newNodeDesc = appendPropertiesToNodeDescription(
      newNodeDesc,
      oldNode.properties,
      replacePattern.oldProperties
    );
  }

  return newNodeDesc;
}

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

export function applyTransformPatternOnLocation(
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
      break;
    case "wrap":
      {
        let oldParentNode = tree.locate(loc).nodeParent;
        let newParentNodeDesc = wrapTransformation(
          oldParentNode,
          [loc.pop()],
          tPattern
        );
        let finalTree = tree.replaceNode(
          oldParentNode.location,
          newParentNodeDesc
        );
        // TODO: Validate that the newParentNodeDesc is still grammatically valid or delegate this task to the caller funciton.
        return finalTree.toModel();
      }
      break;
    case "replace":
      {
        let oldParentNode = tree.locate(loc).nodeParent;
        let newParentNodeDesc = replaceTransformation(
          oldParentNode,
          [loc.pop()],
          tPattern
        );
        let finalTree = tree.replaceNode(
          oldParentNode.location,
          newParentNodeDesc
        );
        // TODO: Validate that the newParentNodeDesc is still grammatically valid or delegate this task to the caller funciton.
        return finalTree.toModel();
      }
      break;
    case "merge":
      break;
    case "split-property":
      break;
  }
}

/**
 * The function that should apply the transformation patterns recursively to the AST,
 * until either no more selectors match from the transformation rules, or no more valid
 * transformations are possible.
 * @param inp
 * @param patterns
 * @returns
 */
export function replaceTemplates(
  inp: SyntaxTree,
  patterns: string[]
): SyntaxTree {
  return inp;
}
