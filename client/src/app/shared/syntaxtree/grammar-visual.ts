import { GrammarDocument } from './grammar.description';
import { getFullQualifiedAttributes } from './grammar-util';

export function isVisualGrammar(g: GrammarDocument): boolean {
  const attrib = getFullQualifiedAttributes(g);
  return (attrib.some(a => a.type === "terminal"));
}