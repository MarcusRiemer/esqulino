import { GrammarDocument } from "./grammar.description";
import { orderTypes, ensureTypename } from "./grammar-type-util";
import { singleLanguageGrammar } from "./grammar.spec-util";

describe(`Grammar Type Utilities`, () => {
  describe(`ensureTypename`, () => {
    it(`strings`, () => {
      expect(ensureTypename("t", "g")).toEqual({
        languageName: "g",
        typeName: "t",
      });
    });

    it(`Qualified Typenames`, () => {
      expect(
        ensureTypename({ languageName: "g", typeName: "t" }, "unused")
      ).toEqual({ languageName: "g", typeName: "t" });
    });

    it(`Child cardinalities`, () => {
      expect(
        ensureTypename(
          { nodeType: { languageName: "g", typeName: "t" }, occurs: "+" },
          "unused"
        )
      ).toEqual({ languageName: "g", typeName: "t" });
    });
  });

  describe(`orderTypes`, () => {
    it(`Unknown Root`, () => {
      const g: GrammarDocument = singleLanguageGrammar("foo", "r", {
        t1: {
          type: "concrete",
          attributes: [],
        },
      });
      const r = orderTypes(g);
      expect(r).toEqual([{ languageName: "foo", typeName: "t1" }]);
    });

    it(`Only Root`, () => {
      const g: GrammarDocument = singleLanguageGrammar("foo", "r", {
        r: {
          type: "concrete",
          attributes: [],
        },
      });

      const r = orderTypes(g);
      expect(r).toEqual([{ languageName: "foo", typeName: "r" }]);
    });

    it(`Root and one unreferenced type`, () => {
      const g: GrammarDocument = singleLanguageGrammar("foo", "r", {
        r: {
          type: "concrete",
          attributes: [],
        },
        t1: {
          type: "concrete",
          attributes: [],
        },
      });

      const r = orderTypes(g);
      expect(r).toEqual([
        { languageName: "foo", typeName: "r" },
        { languageName: "foo", typeName: "t1" },
      ]);
    });

    it(`Root and one unreferenced type (order flipped)`, () => {
      const g: GrammarDocument = singleLanguageGrammar("foo", "r", {
        t1: {
          type: "concrete",
          attributes: [],
        },
        r: {
          type: "concrete",
          attributes: [],
        },
      });

      const r = orderTypes(g);
      expect(r).toEqual([
        { languageName: "foo", typeName: "r" },
        { languageName: "foo", typeName: "t1" },
      ]);
    });

    it(`Root and one illegal reference`, () => {
      const g: GrammarDocument = singleLanguageGrammar("foo", "r", {
        r: {
          type: "concrete",
          attributes: [{ type: "sequence", name: "n", nodeTypes: ["illegal"] }],
        },
        t1: {
          type: "concrete",
          attributes: [],
        },
      });

      const r = orderTypes(g);
      expect(r).toEqual([
        { languageName: "foo", typeName: "r" },
        { languageName: "foo", typeName: "illegal" },
        { languageName: "foo", typeName: "t1" },
      ]);
    });

    it(`Root and multiple references to the same thing`, () => {
      const g: GrammarDocument = singleLanguageGrammar("foo", "r", {
        r: {
          type: "concrete",
          attributes: [
            { type: "sequence", name: "fst", nodeTypes: ["t1"] },
            { type: "allowed", name: "snd", nodeTypes: ["t1", "t1"] },
          ],
        },
        t1: {
          type: "concrete",
          attributes: [],
        },
      });

      const r = orderTypes(g);
      expect(r).toEqual([
        { languageName: "foo", typeName: "r" },
        { languageName: "foo", typeName: "t1" },
      ]);
    });

    it(`Root and recursive reference to self`, () => {
      const g: GrammarDocument = singleLanguageGrammar("foo", "r", {
        r: {
          type: "concrete",
          attributes: [{ type: "choice", name: "fst", choices: ["t1"] }],
        },
        t1: {
          type: "concrete",
          attributes: [{ type: "allowed", name: "fst", nodeTypes: ["r"] }],
        },
      });

      const r = orderTypes(g);
      expect(r).toEqual([
        { languageName: "foo", typeName: "r" },
        { languageName: "foo", typeName: "t1" },
      ]);
    });

    it(`Root and typedef`, () => {
      const g: GrammarDocument = singleLanguageGrammar("foo", "r", {
        t1: {
          type: "oneOf",
          oneOf: ["t2", "t3"],
        },
        t3: {
          type: "concrete",
          attributes: [],
        },
        t2: {
          type: "concrete",
          attributes: [],
        },
        r: {
          type: "concrete",
          attributes: [{ type: "choice", name: "fst", choices: ["t1"] }],
        },
      });

      const r = orderTypes(g);
      expect(r).toEqual([
        { languageName: "foo", typeName: "r" },
        { languageName: "foo", typeName: "t1" },
        { languageName: "foo", typeName: "t2" },
        { languageName: "foo", typeName: "t3" },
      ]);
    });

    it(`Root and recursive typedef`, () => {
      const g: GrammarDocument = singleLanguageGrammar("foo", "r", {
        t1: {
          type: "oneOf",
          oneOf: ["t2", "t3", "t1", "r"],
        },
        t3: {
          type: "concrete",
          attributes: [],
        },
        t2: {
          type: "concrete",
          attributes: [],
        },
        r: {
          type: "concrete",
          attributes: [{ type: "choice", name: "fst", choices: ["t1"] }],
        },
      });

      const r = orderTypes(g);
      expect(r).toEqual([
        { languageName: "foo", typeName: "r" },
        { languageName: "foo", typeName: "t1" },
        { languageName: "foo", typeName: "t2" },
        { languageName: "foo", typeName: "t3" },
      ]);
    });

    it(`Root typedef with bizarre order`, () => {
      const g: GrammarDocument = singleLanguageGrammar("foo", "r", {
        r: {
          type: "oneOf",
          oneOf: ["t3", "t1", "t2"],
        },
        t2: {
          type: "concrete",
          attributes: [],
        },
        t3: {
          type: "concrete",
          attributes: [],
        },
        t1: {
          type: "concrete",
          attributes: [],
        },
      });

      const r = orderTypes(g);
      expect(r).toEqual([
        { languageName: "foo", typeName: "r" },
        { languageName: "foo", typeName: "t3" },
        { languageName: "foo", typeName: "t1" },
        { languageName: "foo", typeName: "t2" },
      ]);
    });

    it(`Root, one chain and unreferenced item`, () => {
      const g: GrammarDocument = singleLanguageGrammar("foo", "r", {
        b4: {
          type: "concrete",
          attributes: [],
        },
        r: {
          type: "concrete",
          attributes: [{ type: "sequence", name: "n", nodeTypes: ["t1"] }],
        },
        unref: {
          type: "concrete",
        },
        a2: {
          type: "concrete",
          attributes: [{ type: "allowed", name: "n", nodeTypes: ["z3"] }],
        },
        t1: {
          type: "concrete",
          attributes: [{ type: "choice", name: "n", choices: ["a2"] }],
        },
        z3: {
          type: "concrete",
          attributes: [{ type: "sequence", name: "n", nodeTypes: ["b4"] }],
        },
      });

      const r = orderTypes(g);
      expect(r).toEqual([
        { languageName: "foo", typeName: "r" },
        { languageName: "foo", typeName: "t1" },
        { languageName: "foo", typeName: "a2" },
        { languageName: "foo", typeName: "z3" },
        { languageName: "foo", typeName: "b4" },
        { languageName: "foo", typeName: "unref" },
      ]);
    });

    it(`Visual containers`, () => {
      const g: GrammarDocument = singleLanguageGrammar("foo", "r", {
        a1_3: { type: "concrete", attributes: [] },
        a1: {
          type: "concrete",
          attributes: [
            { type: "sequence", name: "n", nodeTypes: ["a1_1"] },
            {
              type: "container",
              children: [{ type: "sequence", name: "n", nodeTypes: ["a1_2"] }],
              orientation: "horizontal",
            },
            { type: "sequence", name: "n", nodeTypes: ["a1_1"] },
          ],
        },
        a1_1: { type: "concrete", attributes: [] },
        r: {
          type: "concrete",
          attributes: [{ type: "sequence", name: "n", nodeTypes: ["a1"] }],
        },
        a1_2: { type: "concrete", attributes: [] },
      });

      const r = orderTypes(g);
      expect(r).toEqual([
        { languageName: "foo", typeName: "r" },
        { languageName: "foo", typeName: "a1" },
        { languageName: "foo", typeName: "a1_1" },
        { languageName: "foo", typeName: "a1_2" },
        { languageName: "foo", typeName: "a1_3" },
      ]);
    });

    it(`Nested Visual containers`, () => {
      const g: GrammarDocument = singleLanguageGrammar("foo", "r", {
        a1_3: { type: "concrete", attributes: [] },
        a1: {
          type: "concrete",
          attributes: [
            { type: "sequence", name: "n", nodeTypes: ["a1_1"] },
            {
              type: "container",
              children: [
                {
                  type: "container",
                  orientation: "horizontal",
                  children: [
                    { type: "sequence", name: "n", nodeTypes: ["a1_2"] },
                  ],
                },
              ],
              orientation: "horizontal",
            },
            { type: "sequence", name: "n", nodeTypes: ["a1_1"] },
          ],
        },
        a1_2_1: { type: "concrete", attributes: [] },
        a1_1: { type: "concrete", attributes: [] },
        r: {
          type: "concrete",
          attributes: [{ type: "sequence", name: "n", nodeTypes: ["a1"] }],
        },
        a1_2: {
          type: "concrete",
          attributes: [
            {
              type: "container",
              orientation: "horizontal",
              children: [
                { type: "sequence", name: "n", nodeTypes: ["a1_2"] },
                { type: "sequence", name: "n", nodeTypes: ["a1_2_1"] },
              ],
            },
          ],
        },
      });

      const r = orderTypes(g);
      expect(r).toEqual([
        { languageName: "foo", typeName: "r" },
        { languageName: "foo", typeName: "a1" },
        { languageName: "foo", typeName: "a1_1" },
        { languageName: "foo", typeName: "a1_2" },
        { languageName: "foo", typeName: "a1_2_1" },
        { languageName: "foo", typeName: "a1_3" },
      ]);
    });
  });
});
