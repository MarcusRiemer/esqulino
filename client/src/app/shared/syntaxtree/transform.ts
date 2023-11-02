import {
  NodeDescription,
  NodeLocation,
  SyntaxNode,
  SyntaxTree,
  NodeChildren, 
  locationEquals
} from "./syntaxtree";
import {
  TransformPattern,
  Selector,
  TransformPatternUnwrap,
  TransformPatternWrapWith,
  TransformPatternReplace,
  TransformPatternMergeTwo,
  TransformRule,
  TransformPatternSplitOnProperty,
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
  inplaceInsertPosition?: number
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

/**
 * Takes a parentNode and the location of a child node and a wrap pattern defined by the user.
 * Transforms the tree by unwrapping the child node and appending the children and the properties
 * of it to the parentNode, if specified by the user.
 * When the target node where the orphaned children are to be appended under does not have the
 * required childGroups and the unwrapPattern.position === "in-place", the behaviour becomes
 * undefined. In this case an Exception might be thrown or the resulting transformation might be invalid.
 * @param matchedNodeLoc  The location of the node matched where the transformation should happen.
 * @param unwrapPattern The pattern defined by the user for this transformation.
 * @returns The nodeDescription of the subtree after the transformation.
 */

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
 * @param matchedNodeLoc  The location of the node matched where the transformation should happen.
 * @param wrapPattern The pattern defined by the user for this transformation.
 * @returns The nodeDescription of the subtree after the transformation.
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

/**
 * Takes a parentNode and the location of a child node and a replace pattern defined by the user.
 * Transforms the tree by replacing the matched child node on the parent with a new node,
 * created by appending the children of child node onto the new replacing Node as well as the
 * properties if specified by the user.
 * adding the child node under the childGroup defined by the user.
 * @param parentNode The parent of the node to be wrapped.
 * @param matchedNodeLoc  The location of the node matched where the transformation should happen.
 * @param wrapPattern The pattern defined by the user for this transformation.
 * @returns The nodeDescription of the subtree after the transformation.
 */

export function replaceTransformation(
  parentNode: SyntaxNode,
  matchedNodeLoc: NodeLocation,
  replacePattern: TransformPatternReplace
): NodeDescription {
  //TODO: Either do nothing if no replacement pattern is defined or allow the just delete the matched node if that is the case.
  if (replacePattern.newNode === undefined) return parentNode.toModel();
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
        "end"
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
 * Takes a parentNode and the location of a child node and a mergePattern defined by the user.
 * It assumes that the node to the immediate sibling node to the right of the child node exists and
 * is of the same type as the child node. This check must be made from the caller function.
 * @param parentNode  The parent of the node to be wrapped.
 * @param matchedNodeLoc  The location of the node matched where the transformation should happen.
 * @param mergePattern The pattern defined by the user for this transformation.
 * @returns The nodeDescription of the subtree after the transformation.
 */

export function mergeTwoTransformation(
  parentNode: SyntaxNode,
  matchedLeftNodeLoc: NodeLocation,
  mergePattern: TransformPatternMergeTwo
): NodeDescription {
  let subTree = new SyntaxTree(parentNode.toModel());
  const leftNodeDesc = subTree.locate(matchedLeftNodeLoc).toModel();
  let newMergedNode: NodeDescription = subTree
    .locate(matchedLeftNodeLoc)
    .toModel();
  let matchedRightNodeLoc: NodeLocation = [
    [matchedLeftNodeLoc[0][0], matchedLeftNodeLoc[0][1] + 1],
  ];
  const rightNodeDesc = subTree.locate(matchedRightNodeLoc).toModel();

  // Handle the children:
  switch (mergePattern.oldChildren) {
    case "copy-both": {
      newMergedNode = appendChildGroupsToNodeDescription(
        newMergedNode,
        rightNodeDesc.children,
        "end"
      );
      break;
    }
    case "copy-left":
      break;
    case "copy-right": {
      newMergedNode.children = rightNodeDesc.children;
      break;
    }
    case "ignore": {
      newMergedNode.children = {};
      break;
    }
    default: {

      // TODO: Throw Exception.
      break;
    }
  }

  // Handle the properties:
  switch (mergePattern.oldProperties) {
    case "copy-both": {
      newMergedNode = appendPropertiesToNodeDescription(
        newMergedNode,
        rightNodeDesc.properties,
        "copy"
      );
      break;
    }
    case "copy-left":
      break;
    case "copy-right": {
      newMergedNode.properties = rightNodeDesc.properties;
    }
    case "ignore": {
      newMergedNode.properties = {};
      break;
    }
    default: {
      //TODO: Throw Exception
      break;
    }
  }

  subTree = subTree.deleteNode(matchedRightNodeLoc);
  subTree = subTree.replaceNode(matchedLeftNodeLoc, newMergedNode);
  return subTree.toModel();
}


/**
 * 
 */

export function splitOnPropertyTransformation(
  parentNode: SyntaxNode,
  matchedNodeLoc: NodeLocation,
  splitPropertyPattern: TransformPatternSplitOnProperty
): NodeDescription {
  let subTree = new SyntaxTree(parentNode.toModel());
  const nodeToSplit = subTree.locate(matchedNodeLoc).toModel();
  let newNodesDesc : NodeDescription = {name : "",  language : "",};
  let newChildren = {};

  if(nodeToSplit.properties[splitPropertyPattern.propertyName]) {
    // Defining the node type for the split
    if(splitPropertyPattern.newNodes === "copy-type") {
      newNodesDesc.name = nodeToSplit.name; 
      newNodesDesc.language = nodeToSplit.language; 
    } else {
      newNodesDesc.name = splitPropertyPattern.newNodes.name; 
      newNodesDesc.language = splitPropertyPattern.newNodes.language; 
    }
    // Doing the split of the property.
    const delimiter = splitPropertyPattern.delimiter !== undefined ? splitPropertyPattern.delimiter : ""; 
    let splitPropResult =  nodeToSplit.properties[splitPropertyPattern.propertyName].split(delimiter);
    if(splitPropertyPattern.deleteDelimiter === false) {
      for(let i = 0; i< splitPropResult.length - 1; i++) { // Reappend delimiter up to the last element, excluding the last element
        splitPropResult[i] = splitPropResult[i] + splitPropertyPattern.delimiter; 
      }
    }
    // Delete the property after the splitting
    delete nodeToSplit.properties[splitPropertyPattern.propertyName]; 

    // Creating the new children nodes. 
    let newNodes : NodeDescription[] = [];
    for(let propValue of splitPropResult) {
      let temp : NodeDescription = {
        name: newNodesDesc.name,
        language: newNodesDesc.language,
        properties: {}
      };
      temp.properties[splitPropertyPattern.propertyName] = propValue;

      // Handle old Children
      if(splitPropertyPattern.oldChildren === "copy") {
        temp = appendChildGroupsToNodeDescription(temp, nodeToSplit.children, "end"); 
      }
      // Handle old Properties
      if(splitPropertyPattern.otherProperties !== "ignore") {
        temp = appendPropertiesToNodeDescription(temp, nodeToSplit.properties, "copy"); 
      }
      newNodes.push(temp); 
    }

    let parentNodeDesc : NodeDescription = parentNode.toModel(); 
    // Adding the new children Nodes 
    if(splitPropertyPattern.wraperNode) { // Adding them under a wrapperNode
      let wrapperNodeDesc = splitPropertyPattern.wraperNode;
      if(splitPropertyPattern.newNodesChildgroup === undefined) throw new Error("Expected a childgroup name for the wrapper node, but got undefined.");
      newChildren[splitPropertyPattern.newNodesChildgroup] = newNodes; 
      wrapperNodeDesc = appendChildGroupsToNodeDescription(wrapperNodeDesc, newChildren, "end");
      subTree = subTree.replaceNode(matchedNodeLoc, wrapperNodeDesc)

    } else { // Adding them under the parentNode
      subTree = subTree.deleteNode(matchedNodeLoc); 
      parentNodeDesc = subTree.toModel(); 
      newChildren[matchedNodeLoc[0][0]] = newNodes; 
      parentNodeDesc = appendChildGroupsToNodeDescription(parentNodeDesc, newChildren, "in-place", matchedNodeLoc[0][1]);
      subTree = new SyntaxTree(parentNodeDesc);
    }
  }

  return subTree.toModel();
    
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
  /* TODO: 
  const operation = (calc) => {
    let oldParentNode = tree.locate(loc).nodeParent;
    newParentNodeDesc = calc(oldParentNode);
    let finalTree = tree.replaceNode(
      oldParentNode.location,
      newParentNodeDesc
    );
    // TODO: Validate that the newParentNodeDesc is still grammatically valid or delegate this task to the caller funciton.
    return finalTree.toModel();
    
  }
  */
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
          [loc[-1]], // This makes the loation relative to the parentNode
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
          [loc[-1]],
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
          [loc[-1]],
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
      {
        /* TODO: Rewrite the switch case with a lambda function 
        operation(() => {
          mergeTwoTransformation(
            oldParentNode,
            [loc[-1]],
            tPattern
          );
        });
        */
        let oldParentNode = tree.locate(loc).nodeParent;
        let newParentNodeDesc = mergeTwoTransformation(
          oldParentNode,
          [loc[-1]],
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
    case "split-property":
      {
        let oldParentNode = tree.locate(loc).nodeParent;
        let newParentNodeDesc = splitOnPropertyTransformation(
          oldParentNode,
          [loc[-1]],
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
export function applyRules(
  inp: SyntaxTree,
  rules: TransformRule[]
): SyntaxTree {
  return inp;
  // During every iteration, keep a flag that shows whether a modification was made to the tree or not.
  // If no modification was made and the end of the matching's array is reached or the array is empty
  // (depending on the replacePattern) finish this iteration and continue with the next transform rule.

  // After a transform rule modifies the tree, start again from the beginning.

  // For the case where merge is given as the TransformPattern
  // Start with the first match of the selector.
  // Check that the next element is an immediate sibling.
  // -- If so, merge the two.
  // -- Substract one from the index of every sibling Node address.
  // Else
  // -- Check that the next element is on the same level.
  // -- If the next element is not on the same level
  // ---- If above then delete this address.
  // ---- If below continue merging without deleting this location.
  // If the end of the array is reached, start again from the beginning until the arrays is empty.
}
