import * as Util from './util'

describe('Utility: encodeUriParameters', () => {
  it('{ "a key" : "a value" } => "a%20key=a%20value"', () => {
    expect(Util.encodeUriParameters({ "a key": "a value" })).toEqual("a%20key=a%20value");
  });

  it('{ } => ""', () => {
    expect(Util.encodeUriParameters({})).toEqual("");
  });
});

describe('Utility: isValidResourceId', () => {
  it('identifies valid IDs', () => {
    expect(Util.isValidResourceId("00000000-1111-2222-3333-444444444444")).toEqual(true);
    expect(Util.isValidResourceId("AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE")).toEqual(true);
    expect(Util.isValidResourceId("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")).toEqual(true);

    expect(Util.isValidResourceId("4f1f31c8-4ea3-42bd-9ba3-76a4c1d459b0")).toEqual(true);
    expect(Util.isValidResourceId("4F1F31C8-4EA3-42BD-9BA3-76A4C1D459B0")).toEqual(true);
  });

  it('identifies invalid IDs', () => {
    expect(Util.isValidResourceId("00000000111122223333444444444444")).toEqual(false);
    expect(Util.isValidResourceId("AAAAAAAABBBBCCCCDDDDEEEEEEEEEEEE")).toEqual(false);
  });
});

describe('Utility: arrayEqual', () => {
  it('with empty arrays', () => {
    expect(Util.arrayEqual([], [])).toBeTruthy();
    expect(Util.arrayEqual([1], [])).toBeFalsy();
    expect(Util.arrayEqual([], [1])).toBeFalsy();
  });

  it('with non arrays', () => {
    expect(Util.arrayEqual([], undefined)).toBeFalsy();
    expect(Util.arrayEqual([], null)).toBeFalsy();
    expect(Util.arrayEqual([], "" as any)).toBeFalsy();
    expect(Util.arrayEqual([], 1 as any)).toBeFalsy();

    expect(Util.arrayEqual(undefined, [])).toBeFalsy();
    expect(Util.arrayEqual(null, [])).toBeFalsy();
    expect(Util.arrayEqual("" as any, [])).toBeFalsy();
    expect(Util.arrayEqual(1 as any, [])).toBeFalsy();
  });

  it('Flat arrays', () => {
    expect(Util.arrayEqual([1, 2], [1, 2])).toBeTruthy();
    expect(Util.arrayEqual([2, 1], [2, 1])).toBeTruthy();

    expect(Util.arrayEqual([2, 2], [2, 1])).toBeFalsy();
    expect(Util.arrayEqual([2, 1], [2, 2])).toBeFalsy();

    expect(Util.arrayEqual([2, 2, 2], [2, 2])).toBeFalsy();
    expect(Util.arrayEqual([2, 2], [2, 2, 2])).toBeFalsy();
  })

  it('Different datatypes', () => {
    expect(Util.arrayEqual(['1', '2'], [1, 2])).toBeFalsy();
    expect(Util.arrayEqual(['2', '1'], [2, 1])).toBeFalsy();
  });

  it('Nested arrays', () => {
    expect(Util.arrayEqual([[1, 2]], [[1, 2]])).toBeTruthy();
    expect(Util.arrayEqual([[2, 1]], [[2, 1]])).toBeTruthy();

    expect(Util.arrayEqual([[2, 1]], [[]])).toBeFalsy();
    expect(Util.arrayEqual([[2, 1]], [])).toBeFalsy();
  })

  it('Same Object', () => {
    const obj = { x: 0, y: 1 };
    expect(Util.arrayEqual([obj], [obj])).toBeTruthy();
    expect(Util.arrayEqual([[obj]], [[obj]])).toBeTruthy();
    expect(Util.arrayEqual([[obj], obj], [[obj], obj])).toBeTruthy();
  });

  it('Identical, but different Object', () => {
    const lhs = { x: 0, y: 1 };
    const rhs = { x: 0, y: 1 };
    expect(Util.arrayEqual([lhs], [rhs])).toBeFalsy();
    expect(Util.arrayEqual([[lhs]], [[rhs]])).toBeFalsy();
    expect(Util.arrayEqual([[lhs], lhs], [[rhs], rhs])).toBeFalsy();
  });
});

describe("locationIsOnPath", () => {
  it("[] is on []", () => {
    expect(Util.locationIsOnPath([], [])).toBe(true);
  });

  it(`[] is on [["a", 0]]`, () => {
    expect(Util.locationIsOnPath([], [["a", 0]])).toBe(true);
  });

  it(`[["a", 0]] is on [["a", 0]]`, () => {
    expect(Util.locationIsOnPath([["a", 0]], [["a", 0]])).toBe(true);
  });

  it(`[["a", 0]] is on [["a", 0], ["a", 0]]`, () => {
    expect(Util.locationIsOnPath([["a", 0]], [["a", 0], ["a", 0]])).toBe(true);
  });

  it(`[["a", 0], ["a", 0]] is on [["a", 0], ["a", 0]]`, () => {
    expect(Util.locationIsOnPath([["a", 0], ["a", 0]], [["a", 0], ["a", 0]])).toBe(true);
  });

  it(`[["b", 0]] is not on [["a", 0]]`, () => {
    expect(Util.locationIsOnPath([["b", 0]], [["a", 0]])).toBe(false);
  });

  it(`[["a", 0], ["b", 0]] is not on [["a", 0], ["a", 0]]`, () => {
    expect(Util.locationIsOnPath([["a", 0], ["b", 0]], [["a", 0], ["a", 0]])).toBe(false);
  });
});

describe(`objectOmit`, () => {
  it(`{ a: "a" } without "a"`, () => {
    const res = Util.objectOmit("a", { a: "a" });
    expect(res).toEqual({});
  });

  it(`{ a: "a", b: "b" } without "a"`, () => {
    const res = Util.objectOmit("a", { a: "a", b: "b" });
    expect(res).toEqual({ b: "b" });
  });

  it(`{ a: "a", b: "b" } without "b"`, () => {
    const res = Util.objectOmit("b", { a: "a", b: "b" });
    expect(res).toEqual({ a: "a" });
  });

  it(`{ a: "a", b: "b" } without "c" (which normally wouldn't compile)`, () => {
    const res = Util.objectOmit("c" as any, { a: "a", b: "b" });
    expect(res).toEqual({ a: "a", b: "b" });
  });
});