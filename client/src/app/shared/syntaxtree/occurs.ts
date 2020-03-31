import {
  OccursDescription,
  OccursSpecificDescription,
  isOccursSpecificDescription,
} from "./occurs.description";

export * from "./occurs.description";

/**
 * Resolves the short-hand regex-like occurs definition to a verbose
 * exact description.
 */
export function resolveOccurs(
  desc: OccursDescription
): OccursSpecificDescription {
  switch (desc) {
    case "*":
      return { minOccurs: 0, maxOccurs: +Infinity };
    case "?":
      return { minOccurs: 0, maxOccurs: 1 };
    case "+":
      return { minOccurs: 1, maxOccurs: +Infinity };
    case "1":
      return { minOccurs: 1, maxOccurs: 1 };
    default:
      throw new Error(`Unknown occurences: "${JSON.stringify(desc)}"`);
  }
}

export function isInOccurs(val: number, desc: OccursDescription): boolean {
  let specific = isOccursSpecificDescription(desc) ? desc : resolveOccurs(desc);
  return val <= specific.maxOccurs && val >= specific.minOccurs;
}
