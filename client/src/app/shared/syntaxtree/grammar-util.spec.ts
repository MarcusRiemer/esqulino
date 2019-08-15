import { resolveChildOccurs, isHoleIfEmpty, getFullQualifiedAttributes, getConcreteTypes } from "./grammar-util";
import { NodeTypeDescription, GrammarDocument } from "./grammar.description";

describe(`Grammar Utilities`, () => {
  describe(`resolveOccurs`, () => {
    it(`t1 | g1.t1 => 1`, () => {
      expect(resolveChildOccurs("a")).toEqual({ minOccurs: 1, maxOccurs: 1 });
    });

    it(`t1* | g1.t1* => 0..Inf`, () => {
      expect(resolveChildOccurs({ nodeType: "t1", occurs: "*" }))
        .toEqual({ minOccurs: 0, maxOccurs: +Infinity });

      expect(resolveChildOccurs({ nodeType: { languageName: "g1", typeName: "t1" }, occurs: "*" }))
        .toEqual({ minOccurs: 0, maxOccurs: +Infinity });
    });

    it(`t1+ | g1.t1+ => 1..Inf`, () => {
      expect(resolveChildOccurs({ nodeType: "t1", occurs: "*" }))
        .toEqual({ minOccurs: 0, maxOccurs: +Infinity });

      expect(resolveChildOccurs({ nodeType: { languageName: "g1", typeName: "t1" }, occurs: "*" }))
        .toEqual({ minOccurs: 0, maxOccurs: +Infinity });
    });

    it(`t1? | g1.t1? => 0..1`, () => {
      expect(resolveChildOccurs({ nodeType: "t1", occurs: "?" }))
        .toEqual({ minOccurs: 0, maxOccurs: 1 });

      expect(resolveChildOccurs({ nodeType: { languageName: "g1", typeName: "t1" }, occurs: "?" }))
        .toEqual({ minOccurs: 0, maxOccurs: 1 });
    });

    it(`t1{3,5} | g1.t1{3,5} => 3..5`, () => {
      expect(resolveChildOccurs({ nodeType: "t1", occurs: { minOccurs: 3, maxOccurs: 5 } }))
        .toEqual({ minOccurs: 3, maxOccurs: 5 });

      expect(resolveChildOccurs({ nodeType: { languageName: "g1", typeName: "t1" }, occurs: { minOccurs: 3, maxOccurs: 5 } }))
        .toEqual({ minOccurs: 3, maxOccurs: 5 });
    });
  });

  describe(`isHoleIfEmpty`, () => {
    it(`Sequence: t1`, () => {
      expect(isHoleIfEmpty({
        type: "sequence", name: "a1", nodeTypes: ["t1"]
      })).toBe(true);
    });

    it(`Sequence: t1? t2?`, () => {
      expect(isHoleIfEmpty({
        type: "sequence", name: "a1",
        nodeTypes: [
          { nodeType: "t1", occurs: "?" },
          { nodeType: "t2", occurs: "?" }
        ]
      })).toBe(false);
    });

    it(`Allowed: t1`, () => {
      expect(isHoleIfEmpty({
        type: "allowed", name: "a1", nodeTypes: ["t1"]
      })).toBe(true);
    });

    it(`Allowed: t1? t2?`, () => {
      expect(isHoleIfEmpty({
        type: "allowed", name: "a1",
        nodeTypes: [
          { nodeType: "t1", occurs: "?" },
          { nodeType: "t2", occurs: "?" }
        ]
      })).toBe(false);
    });

    it(`choice`, () => {
      expect(isHoleIfEmpty({
        type: "choice", name: "a1",
        choices: [
          { languageName: "g", typeName: "t1" },
          { languageName: "g", typeName: "t2" }
        ]
      })).toBe(true);
    });
  });

  describe(`getAttributes`, () => {
    // Shorthand to generate a grammar with the relevant properties
    const testGrammar = (name: string, types: { [nodeName: string]: NodeTypeDescription }) => {
      const g: GrammarDocument = {
        technicalName: name,
        root: undefined,
        types: {}
      };

      g.types[name] = types;
      return (g);
    }

    it(`Empty Grammar`, () => {
      const g = testGrammar("g1", {});
      expect(getFullQualifiedAttributes(g)).toEqual([]);
    });

    it(`Single type, single attribute`, () => {
      const g = testGrammar("g1", {
        "t1": {
          type: "concrete",
          attributes: [{ type: "terminal", name: "a1", symbol: "t_a1" }]
        }
      });
      expect(getFullQualifiedAttributes(g)).toEqual([{
        languageName: "g1", typeName: "t1", type: "terminal", name: "a1", symbol: "t_a1"
      }]);
    });

    it(`Single type, two attributes`, () => {
      const g = testGrammar("g1", {
        "t1": {
          type: "concrete",
          attributes: [
            { type: "terminal", name: "a1", symbol: "t_a1" },
            { type: "property", name: "a2", base: "string" }
          ]
        }
      });
      expect(getFullQualifiedAttributes(g)).toEqual([
        { languageName: "g1", typeName: "t1", type: "terminal", name: "a1", symbol: "t_a1" },
        { languageName: "g1", typeName: "t1", type: "property", name: "a2", base: "string" }
      ]);
    });

    it(`Two types, each one attribute`, () => {
      const g = testGrammar("g1", {
        "t1": {
          type: "concrete",
          attributes: [
            { type: "terminal", name: "a1", symbol: "t_a1" },
          ]
        },
        "t2": {
          type: "concrete",
          attributes: [
            { type: "property", name: "a1", base: "string" }
          ]
        }
      });
      expect(getFullQualifiedAttributes(g)).toEqual([
        { languageName: "g1", typeName: "t1", type: "terminal", name: "a1", symbol: "t_a1" },
        { languageName: "g1", typeName: "t2", type: "property", name: "a1", base: "string" }
      ]);
    });

    it(`Two types, "oneOf" ignored`, () => {
      const g = testGrammar("g1", {
        "t1": {
          type: "concrete",
          attributes: [
            { type: "terminal", name: "a1", symbol: "t_a1" },
          ]
        },
        "t2": {
          type: "oneOf",
          oneOf: []
        }
      });
      expect(getFullQualifiedAttributes(g)).toEqual([
        { languageName: "g1", typeName: "t1", type: "terminal", name: "a1", symbol: "t_a1" },
      ]);
    });
  });

  describe(`getAllTypes`, () => {
    it(`g.t1`, () => {
      const g: GrammarDocument = {
        technicalName: "g",
        root: { languageName: "g", typeName: "t1" },
        types: {
          "g": {
            "t1": {
              type: "concrete",
            }
          }
        }
      };

      expect(getConcreteTypes(g)).toEqual([
        { languageName: "g", typeName: "t1" }
      ]);
    });

    it(`g.t1, g.t2`, () => {
      const g: GrammarDocument = {
        technicalName: "g",
        root: { languageName: "g", typeName: "t1" },
        types: {
          "g": {
            "t1": {
              type: "concrete",
            },
            "t2": {
              type: "concrete",
            }
          }
        }
      };

      expect(getConcreteTypes(g)).toEqual([
        { languageName: "g", typeName: "t1" },
        { languageName: "g", typeName: "t2" }
      ]);
    });

    it(`g.t1, h.t1`, () => {
      const g: GrammarDocument = {
        technicalName: "g",
        root: { languageName: "g", typeName: "t1" },
        types: {
          "g": {
            "t1": {
              type: "concrete",
            },
          },
          "h": {
            "t1": {
              type: "concrete",
            }
          }
        }
      };

      expect(getConcreteTypes(g)).toEqual([
        { languageName: "g", typeName: "t1" },
        { languageName: "h", typeName: "t1" }
      ]);
    });

    it(`Omit typedef`, () => {
      const g: GrammarDocument = {
        technicalName: "g",
        root: { languageName: "g", typeName: "t1" },
        types: {
          "g": {
            "t1": {
              type: "oneOf",
              oneOf: []
            },
            "t2": {
              type: "concrete",
            }
          }
        }
      };

      expect(getConcreteTypes(g)).toEqual([
        { languageName: "g", typeName: "t2" }
      ]);
    });

    it(`Missing Types`, () => {
      const g: GrammarDocument = {
        technicalName: "g",
        root: { languageName: "g", typeName: "t1" },
        types: undefined
      };

      expect(getConcreteTypes(g)).toEqual([]);
    });

    it(`Empty Types`, () => {
      const g: GrammarDocument = {
        technicalName: "g",
        root: { languageName: "g", typeName: "t1" },
        types: {}
      };

      expect(getConcreteTypes(g)).toEqual([]);
    });
  });
});
