import {
  GrammarDocument,
  NodeAttributeDescription,
} from "./grammar.description";
import { getFullQualifiedAttributes } from "./grammar-util";

// All type literals that are used for visuals only
const VISUAL_TYPES: Set<NodeAttributeDescription["type"]> = new Set([
  "terminal",
  "container",
]);

/**
 * Checks whether the given grammar contains any visual hints.
 */
export function isVisualGrammar(g: GrammarDocument): boolean {
  const attrib = getFullQualifiedAttributes(g);
  return attrib.some((a) => VISUAL_TYPES.has(a.type));
}
