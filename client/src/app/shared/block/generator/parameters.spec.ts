import * as Desc from './parameters.description'
import {
  ParameterMap
} from './parameters'
import { AllReferenceableTypeInstructions, AllTypeInstructions } from './instructions.description';

describe("BlockLanguage GeneratorInstructions Parameters", () => {
  it("Empty Parameter map is valid", () => {
    const m = new ParameterMap();
    expect(m.validate()).toEqual([]);
  });

  it("Adding matching parameter and value", () => {
    const m = new ParameterMap();
    m.addParameters({
      "foo": {
        "type": { "type": "string" }
      }
    });

    m.addValues({
      "foo": "matchingString"
    });

    expect(m.validate()).toEqual([]);
    expect(m.getValue("foo")).toEqual("matchingString");
  });

  it("Adding only an (unsatisfied) parameter", () => {
    const m = new ParameterMap();
    m.addParameters({
      "foo": {
        "type": { "type": "string" }
      }
    });

    expect(m.validate()).toEqual([
      { "type": "MissingValue", "name": "foo" }
    ]);
  });

  it("Adding a parameter twice", () => {
    const p: Desc.ParameterDeclarations = {
      "foo": {
        "type": { "type": "string" }
      }
    };
    const m = new ParameterMap();
    m.addParameters(p);

    expect(() => m.addParameters(p)).toThrowError();
  });

  it("Adding only an (unwanted) parameter", () => {
    const m = new ParameterMap();
    m.addValues({
      "foo": "unwantedString"
    });

    expect(m.validate()).toEqual([
      { "type": "UnknownParameter", "name": "foo" }
    ]);
    expect(m.getValue("foo")).toEqual("unwantedString");
  });

  it("resolves empty instructions (noop)", () => {
    const m = new ParameterMap();
    const i: AllReferenceableTypeInstructions = {};

    const r = m.resolve(i);
    expect(r).toEqual(i as AllTypeInstructions);
  });

  it("resolves instructions with only grammar (noop)", () => {
    const m = new ParameterMap();
    const i: AllReferenceableTypeInstructions = { "g": {} };

    const r = m.resolve(i);
    expect(r).toEqual(i as AllTypeInstructions);
  });

  it("resolves single block instructions without attributes (noop)", () => {
    const m = new ParameterMap();
    const i: AllReferenceableTypeInstructions = {
      "g1": {
        "t1": {
          type: "single",
          attributes: {}
        }
      }
    };

    const r = m.resolve(i);
    expect(r).toEqual(i as AllTypeInstructions);
  });

  it("resolves single block instructions with value attributes (noop)", () => {
    const m = new ParameterMap();
    const i: AllReferenceableTypeInstructions = {
      "g1": {
        "t1": {
          type: "single",
          attributes: {
            "a1": {
              "between": ",",
              "onDrop": {
                "self": { "order": "insertAfter", skipParents: 0 }
              }
            }
          }
        }
      }
    };

    const r = m.resolve(i);
    expect(r).toEqual(i as AllTypeInstructions);
  });

  it("resolves single block instructions with a reference attribute", () => {
    const m = new ParameterMap();
    m.addParameters({
      "myBetween": {
        type: { "type": "string" }
      }
    });
    m.addValues({
      "myBetween": "parameterValue"
    });
    const i: AllReferenceableTypeInstructions = {
      "g1": {
        "t1": {
          type: "single",
          attributes: {
            "a1": {
              "between": { "$ref": "myBetween" }
            }
          }
        }
      }
    };

    const r = m.resolve(i);
    expect(r["g1"]["t1"]["attributes"]["a1"]["between"]).toEqual("parameterValue");
  });

  it("resolves multi block instructions without blocks (noop)", () => {
    const m = new ParameterMap();
    const i: AllReferenceableTypeInstructions = {
      "g1": {
        "t1": {
          type: "multi",
          blocks: []
        }
      }
    };

    const r = m.resolve(i);
    expect(r).toEqual(i as AllTypeInstructions);
  });

  it("resolves multi block instructions with two blocks (noop)", () => {
    const m = new ParameterMap();
    const i: AllReferenceableTypeInstructions = {
      "g1": {
        "t1": {
          type: "multi",
          blocks: [
            { "type": "single", attributes: {} },
            { "type": "single", attributes: {} }
          ]
        }
      }
    };

    const r = m.resolve(i);
    expect(r).toEqual(i as AllTypeInstructions);
  });
});