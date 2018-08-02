import { resolveOccurs, isHoleIfEmpty, getFullAttributes } from "./grammar-util";
import { NodeTypeDescription } from "./grammar.description";

describe(`Grammar Utilities`, () => {
  describe(`resolveOccurs`, () => {
    it(`t1 | g1.t1 => 1`, () => {
      expect(resolveOccurs("a")).toEqual({ minOccurs: 1, maxOccurs: 1 });
    });

    it(`t1* | g1.t1* => 0..Inf`, () => {
      expect(resolveOccurs({ nodeType: "t1", occurs: "*" }))
        .toEqual({ minOccurs: 0, maxOccurs: +Infinity });

      expect(resolveOccurs({ nodeType: { languageName: "g1", typeName: "t1" }, occurs: "*" }))
        .toEqual({ minOccurs: 0, maxOccurs: +Infinity });
    });

    it(`t1+ | g1.t1+ => 1..Inf`, () => {
      expect(resolveOccurs({ nodeType: "t1", occurs: "*" }))
        .toEqual({ minOccurs: 0, maxOccurs: +Infinity });

      expect(resolveOccurs({ nodeType: { languageName: "g1", typeName: "t1" }, occurs: "*" }))
        .toEqual({ minOccurs: 0, maxOccurs: +Infinity });
    });

    it(`t1? | g1.t1? => 0..1`, () => {
      expect(resolveOccurs({ nodeType: "t1", occurs: "?" }))
        .toEqual({ minOccurs: 0, maxOccurs: 1 });

      expect(resolveOccurs({ nodeType: { languageName: "g1", typeName: "t1" }, occurs: "?" }))
        .toEqual({ minOccurs: 0, maxOccurs: 1 });
    });

    it(`t1{3,5} | g1.t1{3,5} => 3..5`, () => {
      expect(resolveOccurs({ nodeType: "t1", occurs: { minOccurs: 3, maxOccurs: 5 } }))
        .toEqual({ minOccurs: 3, maxOccurs: 5 });

      expect(resolveOccurs({ nodeType: { languageName: "g1", typeName: "t1" }, occurs: { minOccurs: 3, maxOccurs: 5 } }))
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
  });

  describe(`getAttributes`, () => {
    // Shorthand to generate a grammar with the relevant properties
    const testGrammar = (name: string, types: { [nodeName: string]: NodeTypeDescription }) => {
      return ({
        id: undefined,
        name: name,
        programmingLanguageId: "lang",
        root: undefined,
        slug: undefined,
        types: types
      });
    }

    it(`Empty Grammar`, () => {
      const g = testGrammar("g1", {});
      expect(getFullAttributes(g)).toEqual([]);
    });

    it(`Single type, single attribute`, () => {
      const g = testGrammar("g1", {
        "t1": {
          type: "concrete",
          attributes: [{ type: "terminal", name: "a1", symbol: "t_a1" }]
        }
      });
      expect(getFullAttributes(g)).toEqual([{
        grammarName: "g1", typeName: "t1", type: "terminal", name: "a1", symbol: "t_a1"
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
      expect(getFullAttributes(g)).toEqual([
        { grammarName: "g1", typeName: "t1", type: "terminal", name: "a1", symbol: "t_a1" },
        { grammarName: "g1", typeName: "t1", type: "property", name: "a2", base: "string" }
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
      expect(getFullAttributes(g)).toEqual([
        { grammarName: "g1", typeName: "t1", type: "terminal", name: "a1", symbol: "t_a1" },
        { grammarName: "g1", typeName: "t2", type: "property", name: "a1", base: "string" }
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
      expect(getFullAttributes(g)).toEqual([
        { grammarName: "g1", typeName: "t1", type: "terminal", name: "a1", symbol: "t_a1" },
      ]);
    });
  });
});
