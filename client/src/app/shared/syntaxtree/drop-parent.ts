import { NodeLocation, NodeDescription, QualifiedTypeName } from "./syntaxtree.description";
import { Validator } from './validator';
import { Tree, Node } from './syntaxtree';
import { _findMatchInCandidate } from './drop-embrace';
import { ErrorCodes } from './validation-result';
import { SmartDropLocation } from './drop.description';

// These errors signal cardinalty errors that would be triggered
// by inserting a new node.
const CARDINALITY_ERRORS: string[] = [
  ErrorCodes.InvalidMaxOccurences // Suddenly too many nodes
]

/**
 * Determines whether something could be inserted at the given place
 * in the current node.
 */
export function _cardinalityAllowsInsertion(
  validator: Validator,
  node: Node,
  candidate: NodeDescription,
  categoryName: string,
  index: number,
): boolean {
  // Build a new tree with the proposed insertion
  const insertionLocation: NodeLocation = [...node.location, [categoryName, index]];
  const modifiedTree = node.tree.insertNode(insertionLocation, candidate);

  // Validate it and check the errors at the parenting node
  const valResult = validator.validateFromRoot(modifiedTree);
  const modifiedNode = modifiedTree.locate(node.location);
  const errors = valResult.getErrorsOn(modifiedNode);

  // Error out if there is any error that is explained by incorrect cardinality
  return (
    errors
      // Only look at errors in our category
      .filter(err => err.data.category == categoryName)
      .every(err => !CARDINALITY_ERRORS.includes(err.code))
  );
}

/**
 * Walks up the tree to find valid places to insert any
 * of the given candidates.
 *
 * @param validator The rules that must hold after the embracing
 * @param tree The tree to modify
 * @param loc The location of the node to be inserted
 * @param candidates All nodes that could possibly be used to embrace
 */
export function _insertAtAnyParent(
  validator: Validator,
  tree: Tree,
  loc: NodeLocation,
  candidates: NodeDescription[]
): SmartDropLocation[] {
  const toReturn: SmartDropLocation[] = [];

  // Check each candidate that could be appended somewhere ...
  candidates.forEach(candidate => {
    const fillType: QualifiedTypeName = { languageName: candidate.language, typeName: candidate.name };
    let stepsUp = 0; // Number of steps made towards the root

    // ... against each node up to the root
    let currNode = tree.locateOrUndefined(loc);

    // If the searched node does not exist immediatly, we might try to insert
    // something in a location that does not yet exist. In that case we simply
    // assume that we may take the parent of the given location
    if (!currNode) {
      currNode = tree.locateOrUndefined(loc.slice(0, -1));
      stepsUp++;
    }

    while (currNode) {
      // Find out which categories could be theoretically used for
      // the given type
      const nodeValidator = validator.getType(currNode.qualifiedName);
      const insertionCategories = nodeValidator.allowedChildrenCategoryNames
        .filter(existingCategory => nodeValidator.allowsChildType(fillType, existingCategory));

      // Find out which location indices could be used for the given type
      insertionCategories.forEach(categoryName => {
        const theoreticalIndices = currNode.getChildrenInCategory(categoryName).length;

        // <= because insertions may also occur *after* an existing element
        for (let i = 0; i <= theoreticalIndices; ++i) {
          if (_cardinalityAllowsInsertion(validator, currNode, candidate, categoryName, i)) {
            // Slicing needs to be omitted of stepsUp is 0, because [1,2,3].slice(0, 0)
            // returns an empty array.
            const pathBefore = stepsUp !== 0 ? loc.slice(0, -stepsUp) : loc;
            toReturn.push({
              location: [...pathBefore, [categoryName, i]],
              operation: "insert",
              nodeDescription: candidate
            });
          }
        }
      });

      // Go one node up the chain
      currNode = currNode.nodeParent;
      stepsUp++;
    }
  });

  return (toReturn);
}
