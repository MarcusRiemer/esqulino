import {
  NodeChildrenGroupDescription,
  NodeTypesChildReference,
  isQualifiedTypeName,
} from "./grammar.description";
import {
  isOccursSpecificDescription,
  resolveOccurs,
  OccursSpecificDescription,
} from "./occurs";

/**
 * Takes any kind of reference and returns the number of occurences this reference
 * could legally make.
 */
export function resolveChildOccurs(
  typeDesc: NodeTypesChildReference
): OccursSpecificDescription {
  if (typeof typeDesc === "string" || isQualifiedTypeName(typeDesc)) {
    return { minOccurs: 1, maxOccurs: 1 };
  } else if (isOccursSpecificDescription(typeDesc.occurs)) {
    return typeDesc.occurs;
  } else {
    return resolveOccurs(typeDesc.occurs);
  }
}

/**
 * Calculates whether the given child group would definitely be an error if it wouldn't
 * have any children.
 */
export function isHoleIfEmpty(attrDescription: NodeChildrenGroupDescription) {
  switch (attrDescription.type) {
    case "allowed":
    case "sequence":
      // Can we find any evidence that this should be a hole?
      return attrDescription.nodeTypes.some(
        (c) => resolveChildOccurs(c).minOccurs > 0
      );
    case "choice":
      return true;
    default:
      return false;
  }
}
