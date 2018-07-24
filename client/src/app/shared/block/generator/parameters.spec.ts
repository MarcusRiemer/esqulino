import * as Desc from './parameters.description'
import {
  ParameterMap
} from './parameters'

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
});