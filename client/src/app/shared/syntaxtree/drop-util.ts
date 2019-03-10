import { NodeLocation, NodeDescription } from "./syntaxtree.description";
import { Validator } from './validator';
import { Node } from './syntaxtree';
import { ErrorCodes } from './validation-result';


// These errors signal cardinality errors that would be triggered
// by inserting a new node.
const CARDINALITY_ERRORS: string[] = [
  ErrorCodes.InvalidMaxOccurences, // Suddenly too many nodes on "allowed"
  ErrorCodes.SuperflousChild, // Suddenly too many nodes on "sequence"
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
  const candidateType = { languageName: candidate.language, typeName: candidate.name };

  // Is the insertion generally possible?
  if (validator.isKnownType(node.languageName, node.typeName)
    && validator.getType(node).allowsChildType(candidateType, categoryName)) {
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
        .filter(err => err.data.category === categoryName)
        .every(err => !CARDINALITY_ERRORS.includes(err.code))
    );
  } else {
    return (false);
  }
}
