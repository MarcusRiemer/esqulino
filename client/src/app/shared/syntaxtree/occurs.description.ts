import { StringUnion } from "../string-union";

/**
 * A verbos definition of minimum and maximum occurences.
 */
export interface OccursSpecificDescription {
  minOccurs: number;
  maxOccurs: number;
}

export const OccursString = StringUnion("1", "?", "+", "*");

export type OccursString = typeof OccursString.type;

/**
 * Describes limits for occurences.
 */
export type OccursDescription = OccursString | OccursSpecificDescription;

/**
 * @return True, if the given instance probably satisfies "ChildCardinalityDescription"
 */
export function isOccursSpecificDescription(
  obj: any
): obj is OccursSpecificDescription {
  return obj instanceof Object && "minOccurs" in obj && "maxOccurs" in obj;
}
