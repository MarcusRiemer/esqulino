import { Instructions, DefaultInstructions } from './instructions.description'
import { GeneratorInstructions, TypeInstructions } from './instructions'

describe("BlockLanguage GeneratorInstructions", () => {

  it("Hands out empty TypeInstructions as a default", () => {
    const inst = new GeneratorInstructions({
      "g": {}
    });

    expect(inst.typeInstructions("missing", "irrelevant") instanceof TypeInstructions).toBe(true);
    expect(inst.typeInstructions("g", "missing") instanceof TypeInstructions).toBe(true);
  });

  describe("Instructions for single blocks", () => {
    it("Exact and missing scope", () => {
      const specific: Partial<Instructions> = {
        "generateErrorIndicator": "start"
      };
      const inst = new TypeInstructions({
        attributes: {
          "s": specific
        }
      });

      expect(inst.scope("s")).toEqual(specific);
      expect(inst.scope("missing")).toEqual({});
    });

    it("undefined instructions", () => {
      const bound = new TypeInstructions(undefined);
      expect(bound.scope("irrelevant")).toEqual({});
    });

    it("Default values for missing scopes", () => {
      const bound = new TypeInstructions({ attributes: {} });

      expect(bound.scopeBlock(0)).toEqual(DefaultInstructions.blockInstructions, "Block");
      expect(bound.scopeIterator("missing")).toEqual(DefaultInstructions.iteratorInstructions, "Layout");
      expect(bound.scopeTerminal("missing")).toEqual(DefaultInstructions.terminalInstructions, "Terminal");
    });

    it("Mixing specific and default values", () => {
      const bound = new TypeInstructions({
        blocks: [
          {
            "style": {
              "display": "block",
              "color": "red"
            }
          }
        ],
        attributes: {
          "this": {
            "between": "ä",
            "style": {
              "display": "block",
              "color": "red"
            }
          }
        }
      });

      expect(bound.scopeBlock(0)).toEqual(jasmine.objectContaining({
        // "orientation": "horizontal" as Orientation,
        "style": {
          "display": "block",
          "color": "red"
        }
      }));

      expect(bound.scopeIterator("this")).toEqual({
        "between": "ä",
        "breakAfter": false,
        "emptyDropTarget": false,
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

  describe("MultiBlockInstructions", () => {
    it("Uses the same attributes for multiple block", () => {
      const inst = new TypeInstructions({
        blocks: [
          {
            attributeMapping: ["t1"]
          },
          {
            attributeMapping: ["t2"]
          }
        ],
        attributes: {
          "t1": {
            between: "a"
          },
          "t2": {
            between: "b"
          }
        }
      });

      expect(inst.numberOfBlocks).toEqual(2);
    });
  });
});
