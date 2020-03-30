import * as Desc from "./parameters.description";
import { ParameterMap, allReferences } from "./parameters";
import {
  AllReferenceableTypeInstructions,
  AllTypeInstructions,
} from "./instructions.description";

describe("BlockLanguage GeneratorInstructions allReferences()", () => {
  it("Empty object", () => {
    expect(Array.from(allReferences({}))).toEqual([]);
  });

  it("Reference object", () => {
    const ref = { $ref: "foo" };
    expect(Array.from(allReferences(ref))).toEqual([ref]);
  });

  it("Other objects", () => {
    expect(Array.from(allReferences({ a: {}, b: {} }))).toEqual([]);
    expect(Array.from(allReferences({ a: [], b: "" }))).toEqual([]);
    expect(Array.from(allReferences({ a: 123, b: true }))).toEqual([]);
    expect(Array.from(allReferences({ a: undefined, b: null }))).toEqual([]);
  });

  it("Nested", () => {
    const ref1 = { $ref: "foo" };
    const ref2 = { $ref: "bar" };

    expect(Array.from(allReferences({ a: ref1, b: { c: ref2 } }))).toEqual([
      ref1,
      ref2,
    ]);
  });

  it("Actual instructions", () => {
    const inst: AllReferenceableTypeInstructions = {
      g1: {
        t1: {
          attributes: {
            a1: {
              between: { $ref: "nonexistant" },
            },
          },
        },
      },
    };

    expect(Array.from(allReferences(inst))).toEqual([{ $ref: "nonexistant" }]);
  });
});

describe("BlockLanguage GeneratorInstructions Parameters", () => {
  it("Empty Parameter map is valid", () => {
    const m = new ParameterMap();
    expect(m.validate({})).toEqual([]);
  });

  it("Adding matching parameter and value", () => {
    const m = new ParameterMap();
    m.addParameters({
      foo: {
        type: { type: "string" },
      },
    });

    m.addValues({
      foo: "matchingString",
    });

    expect(m.validate({})).toEqual([]);
    expect(m.getValue("foo")).toEqual("matchingString");
  });

  it("Adding only an (unsatisfied) parameter", () => {
    const m = new ParameterMap();
    m.addParameters({
      foo: {
        type: { type: "string" },
      },
    });

    expect(m.validate({})).toEqual([
      { type: "ParameterMissingValue", name: "foo" },
    ]);
  });

  it("Adding only an (unsatisfied) parameter with a default value", () => {
    const m = new ParameterMap();
    m.addParameters({
      foo: {
        type: { type: "string" },
        defaultValue: "default",
      },
    });

    expect(m.validate({})).toEqual([]);
    expect(m.getValue("foo")).toEqual("default");
  });

  it("Adding matching parameter (with ignored default) and value", () => {
    const m = new ParameterMap();
    m.addParameters({
      foo: {
        type: { type: "string" },
        defaultValue: "irrelevant",
      },
    });

    m.addValues({
      foo: "matchingString",
    });

    expect(m.validate({})).toEqual([]);
    expect(m.getValue("foo")).toEqual("matchingString");
  });

  it("Adding a parameter twice", () => {
    const p: Desc.ParameterDeclarations = {
      foo: {
        type: { type: "string" },
      },
    };
    const m = new ParameterMap();
    m.addParameters(p);

    expect(() => m.addParameters(p)).toThrowError();
  });

  it("Adding only an (unwanted) parameter", () => {
    const m = new ParameterMap();
    m.addValues({
      foo: "unwantedString",
    });

    expect(m.validate({})).toEqual([
      { type: "ValueForUnknownParameter", name: "foo" },
    ]);
    expect(m.getValue("foo")).toEqual("unwantedString");
  });

  it("Reference to an unknown parameter", () => {
    const m = new ParameterMap();
    const i: AllReferenceableTypeInstructions = {
      g1: {
        t1: {
          attributes: {
            a1: {
              between: { $ref: "nonexistant" },
            },
          },
        },
      },
    };

    expect(m.validate(i)).toEqual([
      { type: "ReferenceToUnknownParameter", name: "nonexistant" },
    ]);
  });

  it("resolves empty instructions (noop)", () => {
    const m = new ParameterMap();
    const i: AllReferenceableTypeInstructions = {};

    const r = m.resolve(i);
    expect(r).toEqual(i as AllTypeInstructions);
  });

  it("resolves instructions with only grammar (noop)", () => {
    const m = new ParameterMap();
    const i: AllReferenceableTypeInstructions = { g: {} };

    const r = m.resolve(i);
    expect(r).toEqual(i as AllTypeInstructions);
  });

  it("resolves single block instructions without attributes (noop)", () => {
    const m = new ParameterMap();
    const i: AllReferenceableTypeInstructions = {
      g1: {
        t1: {
          attributes: {},
        },
      },
    };

    const r = m.resolve(i);
    expect(r).toEqual(i as AllTypeInstructions);
  });

  it("resolves single block instructions with value attributes (noop)", () => {
    const m = new ParameterMap();
    const i: AllReferenceableTypeInstructions = {
      g1: {
        t1: {
          attributes: {
            a1: {
              between: ",",
              onDrop: {},
            },
          },
        },
      },
    };

    const r = m.resolve(i);
    expect(r).toEqual(i as AllTypeInstructions);
  });

  it("resolves single block instructions with a reference attribute", () => {
    const m = new ParameterMap();
    m.addParameters({
      myBetween: {
        type: { type: "string" },
      },
    });
    m.addValues({
      myBetween: "parameterValue",
    });
    const i: AllReferenceableTypeInstructions = {
      g1: {
        t1: {
          attributes: {
            a1: {
              between: { $ref: "myBetween" },
            },
          },
        },
      },
    };

    const r = m.resolve(i);
    expect(r["g1"]["t1"]["attributes"]["a1"]["between"]).toEqual(
      "parameterValue"
    );
  });

  it("resolves multi block instructions without blocks (noop)", () => {
    const m = new ParameterMap();
    const i: AllReferenceableTypeInstructions = {
      g1: {
        t1: {
          blocks: [],
          attributes: {},
        },
      },
    };

    const r = m.resolve(i);
    expect(r).toEqual(i as AllTypeInstructions);
  });

  it("resolves multi block instructions with two blocks (noop)", () => {
    const m = new ParameterMap();
    const i: AllReferenceableTypeInstructions = {
      g1: {
        t1: {
          blocks: [{}, {}],
          attributes: {},
        },
      },
    };

    const r = m.resolve(i);
    expect(r).toEqual(i as AllTypeInstructions);
  });

  it("resolve-result does not hav any shared references", () => {
    const m = new ParameterMap();
    m.addParameters({
      between: {
        type: { type: "string" },
        defaultValue: ",",
      },
      color: {
        type: { type: "string" },
        defaultValue: "green",
      },
    });
    const i: AllReferenceableTypeInstructions = {
      g1: {
        t1: {
          attributes: {
            t1_a1: {
              between: { $ref: "between" },
              style: {
                color: { $ref: "color" },
              },
            },
          },
          blocks: [{}, {}],
        },
        t2: {
          attributes: {
            a1: {
              between: { $ref: "between" },
              style: {
                color: { $ref: "color" },
              },
            },
          },
        },
      },
    };

    const iCopy: AllReferenceableTypeInstructions = JSON.parse(
      JSON.stringify(i)
    );

    const res = m.resolve(i);
    expect(i).toEqual(iCopy);

    expect("t1" in res.g1).toBe(true);
    expect("t2" in res.g1).toBe(true);
  });
});
