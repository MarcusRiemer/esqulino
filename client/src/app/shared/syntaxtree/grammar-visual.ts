import {
  NodeAttributeDescription,
  NamedLanguages,
} from "./grammar.description";
import { getFullQualifiedAttributes } from "./grammar-type-util";

// All type literals that are used for visuals only
const VISUAL_TYPES: Set<NodeAttributeDescription["type"]> = new Set([
  "terminal",
  "container",
]);

/**
 * Checks whether the given grammar contains any visual hints.
 */
export function hasVisualType(g: NamedLanguages): boolean {
  const attrib = getFullQualifiedAttributes(g);
  return attrib.some((a) => VISUAL_TYPES.has(a.type));
}
