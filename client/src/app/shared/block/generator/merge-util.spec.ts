import { deepAssign } from './merge-util'

describe(`Util: deepAssign`, () => {
  it(`Throws on "undefined" values`, () => {
    expect(() => deepAssign(undefined, {})).toThrowError();
    expect(() => deepAssign({}, undefined)).toThrowError();
  });

  it(`Both empty`, () => {
    expect(deepAssign({}, {})).toEqual({});
  });

  it(`Either side empty`, () => {
    const notEmpty = { "a": "a" };
    expect(deepAssign(notEmpty, {})).toEqual(notEmpty);
    expect(deepAssign({}, notEmpty)).toEqual(notEmpty);
  });

  it(`Unrelated`, () => {
    const lhs = { "a": 1 };
    const rhs = { "b": 2 };
    const exp = { "a": 1, "b": 2 };
    expect(deepAssign(lhs, rhs)).toEqual(exp);
  });

  it(`Related first, unrelated second level`, () => {
    const lhs = { "a": { "b": 1 } }
    const rhs = { "a": { "c": 2 } }
    const exp = { "a": { "b": 1, "c": 2 } };
    expect(deepAssign(lhs, rhs)).toEqual(exp);
  });

  it(`First level conflict: right side has precedence`, () => {
    const lhs = { "a": 1 };
    const rhs = { "a": 2 };
    const res = { "a": 2 };
    expect(deepAssign(lhs, rhs)).toEqual(res);
  });

  it(`Replace anything with Array`, () => {
    expect(deepAssign({ "a": null }, { "a": [] })).toEqual({ "a": [] });
    expect(deepAssign({ "a": true }, { "a": [] })).toEqual({ "a": [] });
    expect(deepAssign({ "a": false }, { "a": [] })).toEqual({ "a": [] });
    expect(deepAssign({ "a": 1 }, { "a": [] })).toEqual({ "a": [] });
    expect(deepAssign({ "a": 0 }, { "a": [] })).toEqual({ "a": [] });
    expect(deepAssign({ "a": "" }, { "a": [] })).toEqual({ "a": [] });
    expect(deepAssign({ "a": [1] }, { "a": [] })).toEqual({ "a": [] });
    expect(deepAssign({ "a": {} }, { "a": [] })).toEqual({ "a": [] });
  });

  it(`Replace Array with everything`, () => {
    expect(deepAssign({ "a": [] }, { "a": null })).toEqual({ "a": null });
    expect(deepAssign({ "a": [] }, { "a": true })).toEqual({ "a": true });
    expect(deepAssign({ "a": [] }, { "a": false })).toEqual({ "a": false });
    expect(deepAssign({ "a": [] }, { "a": 1 })).toEqual({ "a": 1 });
    expect(deepAssign({ "a": [] }, { "a": 0 })).toEqual({ "a": 0 });
    expect(deepAssign({ "a": [] }, { "a": "" })).toEqual({ "a": "" });
    expect(deepAssign({ "a": [] }, { "a": [1] })).toEqual({ "a": [1] });
    expect(deepAssign({ "a": [] }, { "a": {} })).toEqual({ "a": {} });
  });

  it(`Replace primitive with object`, () => {
    expect(deepAssign({ "a": null }, { "a": {} })).toEqual({ "a": {} });
    expect(deepAssign({ "a": true }, { "a": {} })).toEqual({ "a": {} });
    expect(deepAssign({ "a": false }, { "a": {} })).toEqual({ "a": {} });
    expect(deepAssign({ "a": 1 }, { "a": {} })).toEqual({ "a": {} });
    expect(deepAssign({ "a": 0 }, { "a": {} })).toEqual({ "a": {} });
    expect(deepAssign({ "a": "" }, { "a": {} })).toEqual({ "a": {} });
  });
});
