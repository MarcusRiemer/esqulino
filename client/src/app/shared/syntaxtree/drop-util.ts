import {
  NodeLocation,
  NodeDescription,
  NodeLocationStep,
} from "./syntaxtree.description";
import { Validator } from "./validator";
import { SyntaxNode } from "./syntaxtree";
import { ErrorCodes } from "./validation-result";
import { RelativeDropLocation } from "./drop.description";

// These errors signal cardinality errors that would be triggered
// by inserting a new node.
const CARDINALITY_ERRORS: string[] = [
  ErrorCodes.InvalidMaxOccurences, // Suddenly too many nodes on "allowed"
  ErrorCodes.SuperflousChild, // Suddenly too many nodes on "sequence"
];

/**
 * Determines whether something could be inserted at the given place
 * in the current node.
 */
export function _cardinalityAllowsInsertion(
  validator: Validator,
  node: SyntaxNode,
  candidate: NodeDescription,
  categoryName: string,
  index: number
): boolean {
  const candidateType = {
    languageName: candidate.language,
    typeName: candidate.name,
  };

  // Is the insertion generally possible?
  if (
    validator.isKnownType(node.languageName, node.typeName) &&
    validator.getType(node).allowsChildType(candidateType, categoryName)
  ) {
    // Build a new tree with the proposed insertion
    const insertionLocation: NodeLocation = [
      ...node.location,
      [categoryName, index],
    ];
    const modifiedTree = node.tree.insertNode(insertionLocation, candidate);

    // Validate it and check the errors at the parenting node
    const valResult = validator.validateFromRoot(modifiedTree);
    const modifiedNode = modifiedTree.locate(node.location);
    const errors = valResult.getErrorsOn(modifiedNode);

    // Error out if there is any error that is explained by incorrect cardinality
    return (
      errors
        // Only look at errors in our category
        .filter((err) => err.data.category === categoryName)
        .every((err) => !CARDINALITY_ERRORS.includes(err.code))
    );
  } else {
    return false;
  }
}

/**
 * @return True, if the node is in a hole with no place for other nodes.
 */
export function nodeIsInSingularHole(validator: Validator, node: SyntaxNode) {
  if (node.nodeParent) {
    const parent = node.nodeParent;
    const parentType = validator.getType(parent.languageName, parent.typeName);
    const parentCardinality = parentType.validCardinality(
      node.nodeParentCategory
    );
    return (
      parentCardinality.maxOccurs === 1 && parentCardinality.minOccurs === 1
    );
  } else {
    // There may only be a single root
    return true;
  }
}

/**
 * Calculates a possibly shifted drop location relative to the given location.
 */
export function relativeDropLocation(
  loc: NodeLocation,
  relative: RelativeDropLocation
) {
  const relativeToShift = (relative: RelativeDropLocation) => {
    switch (relative) {
      case "begin":
        return -1;
      default:
        return 0;
    }
  };

  if (loc.length > 0) {
    const shift = relativeToShift(relative);
    const prevLast = loc[loc.length - 1];

    // Shallow copy
    const copy = [...loc];

    // New last element, index may not be too far ahead
    const shiftedLast: NodeLocationStep = [
      prevLast[0],
      Math.max(-1, prevLast[1] + shift),
    ];
    copy[copy.length - 1] = shiftedLast;

    // Shallow copy with changed last element, other elements are still shared
    return copy;
  } else {
    return loc;
  }
}
