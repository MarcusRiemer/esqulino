import {
  NodeDescription,
  NodeLocation,
  QualifiedTypeName,
} from "./syntaxtree.description";
import { Tree, Node } from "./syntaxtree";
import { Validator } from "./validator";
import { EmbraceDropLocation } from "./drop.description";

/**
 * Calculates which holes of the given parent would like to be
 * filled with something of the given type. This boils down to
 * all categories that are:
 * - technically allowed to host the filling type
 * - AND currently empty
 */
export function _findPossibleLocations(
  parentNode: Node,
  fillType: QualifiedTypeName,
  validator: Validator
): NodeLocation[] {
  const p = validator.getType(parentNode.qualifiedName);

  // TODO: Factor in the actual validity of the given filling node
  //       A match that does not only work on a superficial level
  //       but also after validation could be preferred.
  //       This would require to actually use the validator, not only
  //       to ask it for allowed child types.
  return p.allowedChildrenCategoryNames
    .filter((existingCategory) => p.allowsChildType(fillType, existingCategory))
    .filter(
      (allowedCategory) =>
        parentNode.getChildrenInCategory(allowedCategory).length === 0
    )
    .map((emptyCategory) => [[emptyCategory, 0]] as NodeLocation);
}

/**
 * Creates a new tree where the given embraced node is inserted at the
 * given location in the embracing node.
 */
export function _localEmbrace(
  embracedNode: Node,
  embracingDescription: NodeDescription,
  insertionLocation: NodeLocation
): NodeDescription {
  const embracingNode = new Tree(embracingDescription);
  const newTree = embracingNode.insertNode(
    insertionLocation,
    embracedNode.toModel()
  );

  return newTree.toModel();
}

/**
 * Looks for the first matching candidate in the given target node.
 *
 * @param validator The rules that must hold after the embracing
 * @param targetNode The node that would like to be embraced.
 * @param candidates The nodes that could embrace the target node.
 * @return The node to be inserted and the position where the insert
 *         should take place in the given target node.
 */
export function _findMatchInCandidate(
  validator: Validator,
  targetNode: Node,
  candidates: NodeDescription[]
): [NodeDescription, NodeLocation] | undefined {
  for (const candidate of candidates) {
    const candidateNode = new Tree(candidate).rootNode;
    const holes = _findPossibleLocations(
      candidateNode,
      targetNode.qualifiedName,
      validator
    );
    if (holes.length > 0) {
      return [candidate, holes[0]];
    }
  }

  return undefined;
}

/**
 * Calculates all drop
 *
 * @param validator The rules that must hold after the embracing
 * @param targetNode The node that would like to be embraced.
 * @param candidates The nodes that could embrace the target node.
 * @return The node to be inserted and the position where the insert
 *         should take place in the given target node.
 */
export function embraceMatches(
  validator: Validator,
  tree: Tree,
  loc: NodeLocation,
  candidates: NodeDescription[]
): EmbraceDropLocation[] {
  const targetNode = tree.locateOrUndefined(loc);
  if (targetNode) {
    const toReturn: EmbraceDropLocation[] = [];
    candidates.forEach((candidate) => {
      const candidateNode = new Tree(candidate).rootNode;
      const holes = _findPossibleLocations(
        candidateNode,
        targetNode.qualifiedName,
        validator
      );
      holes.forEach((hole) => {
        toReturn.push({
          location: loc,
          algorithm: "allowEmbrace",
          nodeDescription: candidate,
          operation: "embrace",
          candidateHole: hole,
        });
      });
    });

    return toReturn;
  } else {
    return [];
  }
}

/**
 * Returns a new tree where the node at the given location has been
 * "embraced" by any of the given candidates.
 *
 * @param validator The rules that must hold after the embracing
 * @param tree The tree to modify
 * @param loc The location of the node to be embraced
 * @param candidates All nodes that could possibly be used to embrace
 * @return The modified tree
 */
export function embraceNode(
  validator: Validator,
  tree: Tree,
  loc: NodeLocation,
  candidates: NodeDescription[]
): Tree {
  // Is there nothing at the embrace target? In that case we have a normal
  // insertion at the given location
  const targetNode = tree.locateOrUndefined(loc);
  if (targetNode) {
    // Find out where in the given candidates the target node could be placed
    const findMatchResult = _findMatchInCandidate(
      validator,
      targetNode,
      candidates
    );

    if (findMatchResult) {
      // The target node exists and can be embraced
      const embracingDescription = findMatchResult[0];
      const localPosition = findMatchResult[1];
      // Create a subtree where the embrace took place
      const embracedNode = _localEmbrace(
        targetNode,
        embracingDescription,
        localPosition
      );
      // Replace the previous node with the subtree it is embedded in
      return tree.replaceNode(loc, embracedNode);
    } else {
      // The target exists, but no candidate is a match
      return tree;
    }
  } else {
    return tree.insertNode(loc, candidates[0]);
  }
}

/**
 * Checks whether the node at the given location would be
 * "embraced" by any of the given candidates.
 *
 * @param validator The rules that must hold after the embracing
 * @param tree The tree to modify
 * @param loc The location of the node to be embraced
 * @param candidates All nodes that could possibly be used to embrace
 * @return The modified tree
 */
export function canEmbraceNode(
  validator: Validator,
  tree: Tree,
  loc: NodeLocation,
  candidates: NodeDescription[]
): boolean {
  return embraceMatches(validator, tree, loc, candidates).length > 0;
}
