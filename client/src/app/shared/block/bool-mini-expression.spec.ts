import { Unrestricted } from './bool-mini-expression.description'
import { evalExpression } from './bool-mini-expression'

describe("Boolean Mini Expressions", () => {
  it(`Constant Values`, () => {
    expect(evalExpression({ $value: true })).toBe(true);
    expect(evalExpression({ $value: false })).toBe(false);
  });

  it(`Variables`, () => {
    expect(evalExpression({ $var: "foo" }, { "foo": true })).toBe(true);
    expect(evalExpression({ $var: "foo" }, { "foo": false })).toBe(false);
    expect(evalExpression<string>({ $var: "foo" }, { "bar": true })).toBe(false);
  });

  it(`Negation`, () => {
    expect(evalExpression({ $not: { $value: true } })).toBe(false);
    expect(evalExpression({ $not: { $value: false } })).toBe(true);
  });

  it(`Every`, () => {
    expect(evalExpression({ "$every": [] })).toBe(true);
    expect(evalExpression({ "$every": [{ $value: true }] })).toBe(true);
    expect(evalExpression({ "$every": [{ $value: false }] })).toBe(false);
    expect(evalExpression({ "$every": [{ $value: false }, { $value: true }] })).toBe(false);
  });

  it(`Some`, () => {
    expect(evalExpression({ "$some": [] })).toBe(false);
    expect(evalExpression({ "$some": [{ $value: true }] })).toBe(true);
    expect(evalExpression({ "$some": [{ $value: false }] })).toBe(false);
    expect(evalExpression({ "$some": [{ $value: false }, { $value: true }] })).toBe(true);
  });

  it(`$every($not($value))`, () => {
    expect(evalExpression({ "$every": [{ "$not": { $value: false } }] })).toBe(true);
    expect(evalExpression({ "$every": [{ "$not": { $value: true } }] })).toBe(false);
  });

  it(`legalDrag && isEmpty`, () => {
    const expr = { "$every": [{ "$var": "ifLegalDrag" }, { "$var": "ifEmpty" }] };

    expect(evalExpression(expr, { "ifLegalDrag": true, "ifEmpty": true })).toBe(true);
    expect(evalExpression(expr, { "ifLegalDrag": true, "ifEmpty": false })).toBe(false);
    expect(evalExpression(expr, { "ifLegalDrag": false, "ifEmpty": true })).toBe(false);
    expect(evalExpression(expr, { "ifLegalDrag": false, "ifEmpty": false })).toBe(false);
  });
});
