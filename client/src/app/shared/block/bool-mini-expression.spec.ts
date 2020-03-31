import { evalExpression } from "./bool-mini-expression";

describe("Boolean Mini Expressions", () => {
  it(`Constant Values`, () => {
    expect(evalExpression({ $value: true })).toBe(true);
    expect(evalExpression({ $value: false })).toBe(false);
  });

  it(`Variables`, () => {
    expect(evalExpression({ $var: "foo" }, { foo: true })).toBe(
      true,
      "Constant true"
    );
    expect(evalExpression({ $var: "foo" }, { foo: false })).toBe(
      false,
      "Constant false"
    );
    expect(evalExpression({ $var: "foo" }, { foo: () => true })).toBe(
      true,
      "Lazy true"
    );
    expect(evalExpression({ $var: "foo" }, { foo: () => false })).toBe(
      false,
      "Lazy false"
    );
    expect(evalExpression<string>({ $var: "foo" }, { bar: true })).toBe(
      false,
      "Missing"
    );
  });

  it(`Negation`, () => {
    expect(evalExpression({ $not: { $value: true } })).toBe(false);
    expect(evalExpression({ $not: { $value: false } })).toBe(true);
  });

  it(`Every`, () => {
    expect(evalExpression({ $every: [] })).toBe(true);
    expect(evalExpression({ $every: [{ $value: true }] })).toBe(true);
    expect(evalExpression({ $every: [{ $value: false }] })).toBe(false);
    expect(
      evalExpression({ $every: [{ $value: false }, { $value: true }] })
    ).toBe(false);
  });

  it(`Some`, () => {
    expect(evalExpression({ $some: [] })).toBe(false);
    expect(evalExpression({ $some: [{ $value: true }] })).toBe(true);
    expect(evalExpression({ $some: [{ $value: false }] })).toBe(false);
    expect(
      evalExpression({ $some: [{ $value: false }, { $value: true }] })
    ).toBe(true);
  });

  it(`$every($not($value))`, () => {
    expect(evalExpression({ $every: [{ $not: { $value: false } }] })).toBe(
      true
    );
    expect(evalExpression({ $every: [{ $not: { $value: true } }] })).toBe(
      false
    );
  });

  it(`legalDrag && isEmpty`, () => {
    const expr = { $every: [{ $var: "ifLegalDrag" }, { $var: "ifEmpty" }] };

    expect(evalExpression(expr, { ifLegalDrag: true, ifEmpty: true })).toBe(
      true
    );
    expect(evalExpression(expr, { ifLegalDrag: true, ifEmpty: false })).toBe(
      false
    );
    expect(evalExpression(expr, { ifLegalDrag: false, ifEmpty: true })).toBe(
      false
    );
    expect(evalExpression(expr, { ifLegalDrag: false, ifEmpty: false })).toBe(
      false
    );
  });

  it(`Lazy evaluation: Two values`, () => {
    let v1Called = false;
    let v2Called = false;

    const res = evalExpression<"v1" | "v2">(
      { $var: "v1" },
      {
        v1: () => {
          v1Called = true;
          return true;
        },
        v2: () => {
          v2Called = true;
          return true;
        },
      }
    );

    expect(res).toBe(true);
    expect(v1Called).toBe(true);
    expect(v2Called).toBe(false);
  });

  it(`Lazy evaluation: Some`, () => {
    let v1Called = false;
    let v2Called = false;

    const res = evalExpression<"v1" | "v2">(
      { $some: [{ $var: "v1" }, { $var: "v2" }] },
      {
        v1: () => {
          v1Called = true;
          return true;
        },
        v2: () => {
          v2Called = true;
          return true;
        },
      }
    );

    expect(res).toBe(true, "result");
    expect(v1Called).toBe(true, "v1Called");
    expect(v2Called).toBe(false, "v2Called");
  });

  it(`Lazy evaluation: Every`, () => {
    let v1Called = false;
    let v2Called = false;

    const res = evalExpression<"v1" | "v2">(
      { $every: [{ $var: "v1" }, { $var: "v2" }] },
      {
        v1: () => {
          v1Called = true;
          return false;
        },
        v2: () => {
          v2Called = true;
          return false;
        },
      }
    );

    expect(res).toBe(false, "result");
    expect(v1Called).toBe(true, "v1Called");
    expect(v2Called).toBe(false, "v2Called");
  });
});
