import { deepAssign } from "./merge-util";

describe(`Util: deepAssign`, () => {
  it(`Primitive: right side wins`, () => {
    expect(deepAssign(1, 2)).toEqual(2);
    expect(deepAssign([], 2)).toEqual(2);
    expect(deepAssign({}, 2)).toEqual(2);
  });

  it(`Object: Both empty`, () => {
    expect(deepAssign({}, {})).toEqual({});
  });

  it(`Object: Either side empty`, () => {
    const notEmpty = { a: "a" };
    expect(deepAssign(notEmpty, {})).toEqual(notEmpty);
    expect(deepAssign({}, notEmpty)).toEqual(notEmpty);
  });

  it(`Object: Unrelated`, () => {
    const lhs = { a: 1 };
    const rhs = { b: 2 };
    const exp = { a: 1, b: 2 };
    expect(deepAssign(lhs, rhs)).toEqual(exp);
  });

  it(`Object: Related first, unrelated second level`, () => {
    const lhs = { a: { b: 1 } };
    const rhs = { a: { c: 2 } };
    const exp = { a: { b: 1, c: 2 } };
    expect(deepAssign(lhs, rhs)).toEqual(exp);
  });

  it(`Object: First level conflict: right side has precedence`, () => {
    const lhs = { a: 1 };
    const rhs = { a: 2 };
    const res = { a: 2 };
    expect(deepAssign(lhs, rhs)).toEqual(res);
  });

  it(`Object: Replace anything with Array`, () => {
    expect(deepAssign({ a: null }, { a: [] })).toEqual({ a: [] });
    expect(deepAssign({ b: true }, { b: [] })).toEqual({ b: [] });
    expect(deepAssign({ c: false }, { c: [] })).toEqual({ c: [] });
    expect(deepAssign({ d: 1 }, { d: [] })).toEqual({ d: [] });
    expect(deepAssign({ e: 0 }, { e: [] })).toEqual({ e: [] });
    expect(deepAssign({ f: "" }, { f: [] })).toEqual({ f: [] });
    expect(deepAssign({ g: {} }, { g: [] })).toEqual({ g: [] });
  });

  it(`Object: Replace Array with everything`, () => {
    expect(deepAssign({ a: [] }, { a: null })).toEqual({ a: null });
    expect(deepAssign({ a: [] }, { a: true })).toEqual({ a: true });
    expect(deepAssign({ a: [] }, { a: false })).toEqual({ a: false });
    expect(deepAssign({ a: [] }, { a: 1 })).toEqual({ a: 1 });
    expect(deepAssign({ a: [] }, { a: 0 })).toEqual({ a: 0 });
    expect(deepAssign({ a: [] }, { a: "" })).toEqual({ a: "" });
    expect(deepAssign({ a: [] }, { a: [1] })).toEqual({ a: [1] });
    expect(deepAssign({ a: [] }, { a: {} })).toEqual({ a: {} });
  });

  it(`Object: Replace primitive with object`, () => {
    expect(deepAssign({ a: null }, { a: {} })).toEqual({ a: {} });
    expect(deepAssign({ a: true }, { a: {} })).toEqual({ a: {} });
    expect(deepAssign({ a: false }, { a: {} })).toEqual({ a: {} });
    expect(deepAssign({ a: 1 }, { a: {} })).toEqual({ a: {} });
    expect(deepAssign({ a: 0 }, { a: {} })).toEqual({ a: {} });
    expect(deepAssign({ a: "" }, { a: {} })).toEqual({ a: {} });
  });

  it(`Array: Merging`, () => {
    expect(deepAssign([], [])).toEqual([], "Case 1");
    expect(deepAssign([1], [])).toEqual([1], "Case 2");
    expect(deepAssign([], [1])).toEqual([1], "Case 3");
    expect(deepAssign([1], [2])).toEqual([2], "Case 4");
    expect(deepAssign([[]], [2])).toEqual([2], "Case 5");
    expect(deepAssign([{}], [2])).toEqual([2], "Case 6");
    expect(deepAssign([1, 2], [])).toEqual([1, 2], "Case 7");
    expect(deepAssign([1, 2], [3])).toEqual([3, 2], "Case 7");
    expect(deepAssign([1, 2], [3, 4])).toEqual([3, 4], "Case 7");
    expect(deepAssign([1, 2], [3, 4, 5])).toEqual([3, 4, 5], "Case 7");
    expect(deepAssign([[1], [2]], [[3], [4]])).toEqual([[3], [4]], "Case 8");
    expect(deepAssign([1, 2], [1, 2, 3])).toEqual([1, 2, 3], "Case 9");
  });
});
