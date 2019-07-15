import { GRAMMAR_ARITHMETIC_DESCRIPTION } from "./grammar.spec.arithmetic";
import { GRAMMAR_BOOLEAN_DESCRIPTION } from './grammar.spec.boolean';
import { GRAMMAR_SQL_DESCRIPTION } from './grammar.spec.sql';
import { isVisualGrammar } from './grammar-visual';

describe(`Visual Grammar`, () => {
  it(`isVisual() for spec languages`, () => {
    expect(isVisualGrammar(GRAMMAR_ARITHMETIC_DESCRIPTION)).toBe(false);
    expect(isVisualGrammar(GRAMMAR_BOOLEAN_DESCRIPTION)).toBe(false);
    expect(isVisualGrammar(GRAMMAR_SQL_DESCRIPTION)).toBe(true);
  });
});