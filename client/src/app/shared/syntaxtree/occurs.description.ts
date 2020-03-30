/**
 * A verbos definition of minimum and maximum occurences.
 */
export interface OccursSpecificDescription {
  minOccurs: number;
  maxOccurs: number;
}

/**
 * Describes limits for occurences.
 */
export type OccursDescription =
  | "1"
  | "?"
  | "+"
  | "*"
  | OccursSpecificDescription;

/**
 * @return True, if the given instance probably satisfies "ChildCardinalityDescription"
 */
export function isOccursSpecificDescription(
  obj: any
): obj is OccursSpecificDescription {
  return obj instanceof Object && "minOccurs" in obj && "maxOccurs" in obj;
}
