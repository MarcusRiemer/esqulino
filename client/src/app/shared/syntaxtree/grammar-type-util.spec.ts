import {
  GrammarDocument,
  NodeConcreteTypeDescription,
} from "./grammar.description";
import {
  orderTypes,
  ensureTypename,
  allPresentTypes,
} from "./grammar-type-util";
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

    it(`Root is foreign type`, () => {
      const g: GrammarDocument = {
        types: {},
        foreignTypes: {
          l: {
            root: { type: "concrete", attributes: [] },
          },
        },
        root: { languageName: "l", typeName: "root" },
      };

      const r = orderTypes(g);
      expect(r).toEqual([{ languageName: "l", typeName: "root" }]);
    });

    it(`Root is foreign type, references local type`, () => {
      const g: GrammarDocument = {
        types: {
          l: {
            t1: { type: "concrete", attributes: [] },
          },
        },
        foreignTypes: {
          l: {
            root: {
              type: "concrete",
              attributes: [{ type: "sequence", name: "n", nodeTypes: ["t1"] }],
            },
          },
        },
        root: { languageName: "l", typeName: "root" },
      };

      const r = orderTypes(g);
      expect(r).toEqual([
        { languageName: "l", typeName: "root" },
        { languageName: "l", typeName: "t1" },
      ]);
    });

    it(`Root is local type, references foreign type`, () => {
      const g: GrammarDocument = {
        types: {
          l: {
            root: {
              type: "concrete",
              attributes: [{ type: "sequence", name: "n", nodeTypes: ["t1"] }],
            },
          },
        },
        foreignTypes: {
          l: {
            t1: { type: "concrete", attributes: [] },
          },
        },
        root: { languageName: "l", typeName: "root" },
      };

      const r = orderTypes(g);
      expect(r).toEqual([
        { languageName: "l", typeName: "root" },
        { languageName: "l", typeName: "t1" },
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

  describe(`allPresentTypes`, () => {
    const typeEmpty: NodeConcreteTypeDescription = {
      type: "concrete",
      attributes: [],
    };

    const typeTerminalA: NodeConcreteTypeDescription = {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          symbol: "a",
        },
      ],
    };

    it(`No types at all`, () => {
      const g: GrammarDocument = {
        types: {},
        foreignTypes: {},
      };

      expect(allPresentTypes(g)).toEqual({});
    });

    it(`Empty local language`, () => {
      const g: GrammarDocument = {
        types: { l: {} },
        foreignTypes: {},
      };

      expect(allPresentTypes(g)).toEqual({ l: {} });
    });

    it(`Empty foreign language`, () => {
      const g: GrammarDocument = {
        types: {},
        foreignTypes: { l: {} },
      };

      expect(allPresentTypes(g)).toEqual({ l: {} });
    });

    it(`Identical empty foreign and local language`, () => {
      const g: GrammarDocument = {
        types: { l: {} },
        foreignTypes: { l: {} },
      };

      expect(allPresentTypes(g)).toEqual({ l: {} });
    });

    it(`Different empty foreign and local language`, () => {
      const g: GrammarDocument = {
        types: { l1: {} },
        foreignTypes: { l2: {} },
      };

      expect(allPresentTypes(g)).toEqual({ l1: {}, l2: {} });
    });

    it(`Local language with single type`, () => {
      const g: GrammarDocument = {
        types: { l: { t: typeEmpty } },
        foreignTypes: {},
      };

      expect(allPresentTypes(g)).toEqual({ l: { t: typeEmpty } });
    });

    it(`Foreign language with single type`, () => {
      const g: GrammarDocument = {
        types: {},
        foreignTypes: { l: { t: typeEmpty } },
      };

      expect(allPresentTypes(g)).toEqual({ l: { t: typeEmpty } });
    });

    it(`Local and foreign language with identical single type`, () => {
      const g: GrammarDocument = {
        types: { l: { t: typeEmpty } },
        foreignTypes: { l: { t: typeEmpty } },
      };

      expect(allPresentTypes(g)).toEqual({ l: { t: typeEmpty } });
    });

    it(`Local precedence: Termninal a`, () => {
      const g: GrammarDocument = {
        types: { l: { t: typeTerminalA } },
        foreignTypes: { l: { t: typeEmpty } },
      };

      expect(allPresentTypes(g)).toEqual({ l: { t: typeTerminalA } });
    });

    it(`Local precedence: Empty`, () => {
      const g: GrammarDocument = {
        types: { l: { t: typeEmpty } },
        foreignTypes: { l: { t: typeTerminalA } },
      };

      expect(allPresentTypes(g)).toEqual({ l: { t: typeEmpty } });
    });

    it(`Local precedence: Termninal a, additional local`, () => {
      const g: GrammarDocument = {
        types: { l: { t1: typeTerminalA, t2: typeTerminalA } },
        foreignTypes: { l: { t1: typeEmpty } },
      };

      expect(allPresentTypes(g)).toEqual({
        l: { t1: typeTerminalA, t2: typeTerminalA },
      });
    });

    it(`Local precedence: Termninal a, additional foreign`, () => {
      const g: GrammarDocument = {
        types: { l: { t1: typeTerminalA } },
        foreignTypes: { l: { t1: typeEmpty, t2: typeTerminalA } },
      };

      expect(allPresentTypes(g)).toEqual({
        l: { t1: typeTerminalA, t2: typeTerminalA },
      });
    });
  });
});
