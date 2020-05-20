import { AllReferenceableTypeInstructions } from "./instructions.description";
import { deepAssign } from "./merge-util";

/**
 * A "best effort" approach to merge two different sets of type
 * instructions. The `additional` instructions take precedence
 * over the `target` and only objects are properly merged.
 *
 * This is easy if the types in the values of either side are identical.
 * But if this is not the case: Every value that is not an object (yes,
 * arrays are not objects) simply "wins" over an object on in `target`
 * because mismatched types are hard to do right.
 */
export function mergeTypeInstructions(
  target: AllReferenceableTypeInstructions,
  additional: AllReferenceableTypeInstructions
): AllReferenceableTypeInstructions {
  // Doing these copies ensures that (even if references are assigned)
  // there is never a shared state between the resulting type and any
  // of parameter types.
  target = JSON.parse(JSON.stringify(target));
  additional = JSON.parse(JSON.stringify(additional));

  return deepAssign(target, additional);
}
