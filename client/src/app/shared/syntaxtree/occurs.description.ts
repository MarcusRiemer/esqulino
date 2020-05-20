import { StringUnion } from "../string-union";

/**
 * A verbos definition of minimum and maximum occurences.
 */
export interface OccursSpecificDescription {
  minOccurs: number;
  maxOccurs: number;
}

export const OccursString = StringUnion("1", "?", "+", "*");
// TODO: Using `typeof OccursString.type` crashes the JSON generator
export type OccursString = "1" | "?" | "+" | "*";

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
