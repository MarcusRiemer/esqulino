import { GrammarDescription } from '../../syntaxtree/grammar.description'

import { Instructions, DefaultInstructions } from './instructions.description'
import { GeneratorInstructions, SingleBlockInstructions, MultiBlockInstructions } from './instructions'
import { Orientation } from '../block.description';

describe("BlockLanguage GeneratorInstructions", () => {

  it("Hands out matching instruction types", () => {
    const inst = new GeneratorInstructions({
      "g": {
        "tSingle": {},
        "tMulti": {
          type: "multi",
          blocks: []
        }
      }
    });

    expect(inst.typeInstructions("g", "tSingle") instanceof SingleBlockInstructions).toBe(true);
    expect(inst.typeInstructions("g", "tMulti") instanceof MultiBlockInstructions).toBe(true);
  });

  it("Hands out empty SingleBlockInstructions as a default", () => {
    const inst = new GeneratorInstructions({
      "g": {}
    });

    expect(inst.typeInstructions("missing", "irrelevant") instanceof SingleBlockInstructions).toBe(true);
    expect(inst.typeInstructions("g", "missing") instanceof SingleBlockInstructions).toBe(true);
  });

  describe("SingleBlockInstructions", () => {
    it("Exact and missing scope", () => {
      const specific: Partial<Instructions> = {
        orientation: "horizontal"
      };
      const inst = new SingleBlockInstructions({
        "s": specific
      });

      expect(inst.scope("s")).toEqual(specific);
      expect(inst.scope("missing")).toEqual({});
    });

    it("undefined instructions", () => {
      const bound = new SingleBlockInstructions(undefined);
      expect(bound.scope("irrelevant")).toEqual({});
    });

    it("Default values for missing scopes", () => {
      const bound = new SingleBlockInstructions({});

      expect(bound.scopeBlock()).toEqual(DefaultInstructions.blockInstructions, "Block");
      expect(bound.scopeIterator("missing")).toEqual(DefaultInstructions.iteratorInstructions, "Layout");
      expect(bound.scopeTerminal("missing")).toEqual(DefaultInstructions.terminalInstructions, "Terminal");
    });

    it("Mixing specific and default values", () => {
      const bound = new SingleBlockInstructions({
        "this": {
          "between": "ä",
          "style": {
            "display": "block",
            "color": "red"
          }
        }
      });

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

    it("Knows that `this` is a reserved name and not an actual type", () => {
      const inst = new SingleBlockInstructions({ "this": {}, "that": {} });
      expect(inst.specifiedTypes).toEqual(["that"]);
    });
  });

  describe("MultiBlockInstructions", () => {
    it("Properly constructs SingleBlockInstructions", () => {
      const inst = new MultiBlockInstructions({
        type: "multi",
        blocks: [
          {
            "t1": {
              orientation: "horizontal"
            }
          },
          {
            "t1": {
              orientation: "vertical"
            }
          }
        ]
      });

      expect(inst.blocks.length).toEqual(2);

      const fst = inst.blocks[0];
      expect(fst.scope("t1")).toEqual({ orientation: "horizontal" });

      const snd = inst.blocks[1];
      expect(snd.scope("t1")).toEqual({ orientation: "vertical" });
    });
  });
});
