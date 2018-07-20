import { GrammarDescription } from '../../syntaxtree/grammar.description'

import { Instructions, DefaultInstructions } from './instructions.description'
import { SafeGeneratorInstructions, SafeTypeInstructions } from './instructions'
import { Orientation } from '../block.description';

describe("BlockLanguage Generator Instructions", () => {
  it("does not crash on undefined instructions", () => {
    const inst = new SafeGeneratorInstructions(undefined);

    expect(inst.scope()).toEqual({});
    expect(inst.scope("g")).toEqual({});
    expect(inst.scope("g", "t")).toEqual({});
    expect(inst.scope("g", "t", "s")).toEqual({});
  });

  it("does not crash on empty instructions", () => {
    const inst = new SafeGeneratorInstructions({});

    expect(inst.scope()).toEqual({});
    expect(inst.scope("g")).toEqual({});
    expect(inst.scope("g", "t")).toEqual({});
    expect(inst.scope("g", "t", "s")).toEqual({});
  });

  it("delivers instructions exactly as given", () => {
    const specific: Partial<Instructions> = {
      orientation: "horizontal"
    };
    const inst = new SafeGeneratorInstructions({
      "g": {
        "t": {
          "s": specific
        }
      }
    });

    expect(inst.scope("g", "t", "s")).toEqual(specific);
  });

  it("delivers empty instructions on missing paths", () => {
    const inst = new SafeGeneratorInstructions({
      "g": {
        "t": {
        }
      }
    });

    expect(inst.scope("missing", "t", "s")).toEqual({});
    expect(inst.scope("g", "missing", "s")).toEqual({});
    expect(inst.scope("g", "t", "missing")).toEqual({});
  });

  it("bounded instructions for non-existing types give default values", () => {
    const inst = new SafeGeneratorInstructions({
      "g": {
        "t": {
        }
      }
    });

    const bound = inst.type("g", "t");
    expect(bound.scopeBlock()).toEqual(DefaultInstructions.blockInstructions, "Block");
    expect(bound.scopeIterator("missing")).toEqual(DefaultInstructions.iteratorInstructions, "Layout");
    expect(bound.scopeTerminal("missing")).toEqual(DefaultInstructions.terminalInstructions, "Terminal");
  });

  it("bounded instructions existing types prefer specific values", () => {
    const inst = new SafeGeneratorInstructions({
      "g": {
        "t": {
          "this": {
            "between": "ä",
            "style": {
              "display": "block",
              "color": "red"
            }
          }
        }
      }
    });

    const bound = inst.type("g", "t");
    expect(bound.scopeBlock()).toEqual(jasmine.objectContaining({
      "orientation": "horizontal" as Orientation,
      "style": {
        "display": "block",
        "color": "red"
      }
    }));
    expect(bound.scopeIterator("this")).toEqual({
      "between": "ä",
      "orientation": "horizontal",
      "style": {
        "display": "block",
        "color": "red"
      }
    });
    expect(bound.scopeTerminal("this")).toEqual(jasmine.objectContaining({
      "style": {
        "display": "block",
        "color": "red"
      }
    }));
  });
});
