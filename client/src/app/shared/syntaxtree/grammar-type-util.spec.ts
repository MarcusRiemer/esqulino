import {
  GrammarDocument,
  NodeConcreteTypeDescription,
  NodeOneOfTypeDescription,
  NamedLanguages,
  NodeVisualTypeDescription,
  isNodeOneOfTypeDescription,
  NodeTypeDescription,
} from "./grammar.description";
import {
  orderTypes,
  ensureTypename,
  allConcreteTypes,
  getTypeList,
  ensureGrammarAttributeNames,
  getFullQualifiedAttributes,
  getConcreteTypes,
  getQualifiedTypes,
  resolveToConcreteTypes,
  allVisualisableTypes,
} from "./grammar-type-util";
import {
  mkGrammarDoc,
  mkSingleLanguageGrammar,
  mkTypeGrammarDoc,
} from "./grammar.spec-util";

describe(`Grammar Type Utilities`, () => {
  describe(`getTypeList()`, () => {
    it(`Empty`, () => {
      expect(getTypeList({})).toEqual([]);
    });

    it(`Single Type`, () => {
      expect(
        getTypeList({
          l: { t: { type: "concrete" } },
        })
      ).toEqual([{ languageName: "l", typeName: "t" }]);
    });
  });

  describe(`resolveToConcreteTypes()`, () => {
    it(`l.t is a concrete type`, () => {
      expect(
        resolveToConcreteTypes(
          { languageName: "l", typeName: "r" },
          {
            l: {
              r: {
                type: "concrete",
                attributes: [],
              },
            },
          }
        )
      ).toEqual([{ languageName: "l", typeName: "r" }]);
    });

    it(`Typedef for a single, concrete type`, () => {
      expect(
        resolveToConcreteTypes(
          { languageName: "l", typeName: "r" },
          {
            l: {
              r: {
                type: "oneOf",
                oneOf: ["l1"],
              },
              l1: {
                type: "concrete",
                attributes: [],
              },
            },
          }
        )
      ).toEqual([{ languageName: "l", typeName: "l1" }]);
    });

    it(`Typedef for a single typedef with a single concrete type`, () => {
      expect(
        resolveToConcreteTypes(
          { languageName: "l", typeName: "r" },
          {
            l: {
              r: {
                type: "oneOf",
                oneOf: ["l1"],
              },
              l1: {
                type: "oneOf",
                oneOf: ["l2"],
              },
              l2: {
                type: "concrete",
                attributes: [],
              },
            },
          }
        )
      ).toEqual([{ languageName: "l", typeName: "l2" }]);
    });

    it(`Typedef with mixed resolution`, () => {
      expect(
        resolveToConcreteTypes(
          { languageName: "l", typeName: "r" },
          {
            l: {
              r: {
                type: "oneOf",
                oneOf: ["l1", "l3"],
              },
              l1: {
                type: "oneOf",
                oneOf: ["l2"],
              },
              l2: {
                type: "concrete",
                attributes: [],
              },
              l3: {
                type: "concrete",
                attributes: [],
              },
            },
          }
        )
      ).toEqual([
        { languageName: "l", typeName: "l2" },
        { languageName: "l", typeName: "l3" },
      ]);
    });

    it(`Typedef with mixed resolution and double appearances`, () => {
      expect(
        resolveToConcreteTypes(
          { languageName: "l", typeName: "r" },
          {
            l: {
              r: {
                type: "oneOf",
                oneOf: ["l1", "l2", "l3"],
              },
              l1: {
                type: "oneOf",
                oneOf: ["l2"],
              },
              l2: {
                type: "concrete",
                attributes: [],
              },
              l3: {
                type: "concrete",
                attributes: [],
              },
            },
          }
        )
      ).toEqual([
        { languageName: "l", typeName: "l2" },
        { languageName: "l", typeName: "l3" },
      ]);
    });

    it(`Typedef for a single, concrete type in another language`, () => {
      expect(
        resolveToConcreteTypes(
          { languageName: "l", typeName: "r" },
          {
            l: {
              r: {
                type: "oneOf",
                oneOf: [{ languageName: "o", typeName: "o1" }],
              },
            },
            o: {
              o1: {
                type: "concrete",
                attributes: [],
              },
            },
          }
        )
      ).toEqual([{ languageName: "o", typeName: "o1" }]);
    });
  });

  describe(`Ensuring attribute names`, () => {
    it(`Concrete type without attributes at all`, () => {
      const named = ensureGrammarAttributeNames({
        spec: {
          root: {
            type: "concrete",
          },
        },
      });
      const root = named["spec"]["root"] as NodeConcreteTypeDescription;

      expect(root.attributes).toBeUndefined();
    });

    it(`Single terminal`, () => {
      const named = ensureGrammarAttributeNames({
        spec: {
          root: {
            type: "concrete",
            attributes: [{ type: "terminal", symbol: "t" }],
          },
        },
      });
      const root = named["spec"]["root"] as NodeConcreteTypeDescription;

      expect(root.attributes).toEqual([
        { type: "terminal", symbol: "t", name: "terminal_0" },
      ]);
    });

    it(`Terminals and properties mixed`, () => {
      const named = ensureGrammarAttributeNames({
        spec: {
          root: {
            type: "concrete",
            attributes: [
              { type: "terminal", symbol: "t1" },
              { type: "property", base: "integer", name: "p" },
              { type: "terminal", symbol: "t2" },
            ],
          },
        },
      });
      const root = named["spec"]["root"] as NodeConcreteTypeDescription;

      expect(root.attributes).toEqual([
        { type: "terminal", symbol: "t1", name: "terminal_0" },
        { type: "property", base: "integer", name: "p" },
        { type: "terminal", symbol: "t2", name: "terminal_2" },
      ]);
    });

    it(`oneOf doesn't have names and must remain unchanged`, () => {
      const input: NamedLanguages = {
        spec: {
          root: {
            type: "oneOf",
            oneOf: ["a", "b"],
          },
        },
      };
      const named = ensureGrammarAttributeNames(input);
      const processed = named["spec"]["root"] as NodeOneOfTypeDescription;
      const original = input["spec"]["root"] as NodeOneOfTypeDescription;

      expect(processed).toEqual(original);
    });

    it(`Single unnamed container`, () => {
      const input: NamedLanguages = {
        spec: {
          root: {
            type: "concrete",
            attributes: [
              { type: "container", orientation: "horizontal", children: [] },
            ],
          },
        },
      };

      const named = ensureGrammarAttributeNames(input);
      const root = named["spec"]["root"] as NodeConcreteTypeDescription;

      expect(root.attributes).toEqual([
        {
          type: "container",
          name: "container_0",
          orientation: "horizontal",
          children: [],
        },
      ]);
    });

    it(`Single named container with unnamed child`, () => {
      const input: NamedLanguages = {
        spec: {
          root: {
            type: "concrete",
            attributes: [
              {
                type: "container",
                orientation: "horizontal",
                name: "foobar",
                children: [{ type: "terminal", symbol: "t1" }],
              },
            ],
          },
        },
      };

      const named = ensureGrammarAttributeNames(input);
      const root = named["spec"]["root"] as NodeConcreteTypeDescription;

      expect(root.attributes).toEqual([
        {
          type: "container",
          name: "foobar",
          orientation: "horizontal",
          children: [
            { type: "terminal", symbol: "t1", name: "foobar_terminal_0" },
          ],
        },
      ]);
    });

    it(`Single named container with named child`, () => {
      const input: NamedLanguages = {
        spec: {
          root: {
            type: "concrete",
            attributes: [
              {
                type: "container",
                orientation: "horizontal",
                name: "upper",
                children: [{ type: "terminal", symbol: "t1", name: "lower" }],
              },
            ],
          },
        },
      };

      const named = ensureGrammarAttributeNames(input);
      const root = named["spec"]["root"] as NodeConcreteTypeDescription;

      expect(root.attributes).toEqual([
        {
          type: "container",
          name: "upper",
          orientation: "horizontal",
          children: [{ type: "terminal", symbol: "t1", name: "lower" }],
        },
      ]);
    });

    it(`Single unnamed container with unnamed child`, () => {
      const input: NamedLanguages = {
        spec: {
          root: {
            type: "concrete",
            attributes: [
              {
                type: "container",
                orientation: "horizontal",
                children: [{ type: "terminal", symbol: "t1" }],
              },
            ],
          },
        },
      };

      const named = ensureGrammarAttributeNames(input);
      const root = named["spec"]["root"] as NodeConcreteTypeDescription;

      expect(root.attributes).toEqual([
        {
          type: "container",
          name: "container_0",
          orientation: "horizontal",
          children: [
            { type: "terminal", symbol: "t1", name: "container_0_terminal_0" },
          ],
        },
      ]);
    });

    it(`Single unnamed container with named child`, () => {
      const input: NamedLanguages = {
        spec: {
          root: {
            type: "concrete",
            attributes: [
              {
                type: "container",
                orientation: "horizontal",
                children: [{ type: "terminal", symbol: "t1", name: "bottom" }],
              },
            ],
          },
        },
      };

      const named = ensureGrammarAttributeNames(input);
      const root = named["spec"]["root"] as NodeConcreteTypeDescription;

      expect(root.attributes).toEqual([
        {
          type: "container",
          name: "container_0",
          orientation: "horizontal",
          children: [{ type: "terminal", symbol: "t1", name: "bottom" }],
        },
      ]);
    });
  });

  describe(`getAttributes`, () => {
    it(`Empty Grammar`, () => {
      expect(getFullQualifiedAttributes({})).toEqual([]);
    });

    it(`Single type, single attribute`, () => {
      expect(
        getFullQualifiedAttributes({
          g1: {
            t1: {
              type: "concrete",
              attributes: [{ type: "terminal", name: "a1", symbol: "t_a1" }],
            },
          },
        })
      ).toEqual([
        {
          languageName: "g1",
          typeName: "t1",
          type: "terminal",
          name: "a1",
          symbol: "t_a1",
        },
      ]);
    });

    it(`Single type, two attributes`, () => {
      expect(
        getFullQualifiedAttributes({
          g1: {
            t1: {
              type: "concrete",
              attributes: [
                { type: "terminal", name: "a1", symbol: "t_a1" },
                { type: "property", name: "a2", base: "string" },
              ],
            },
          },
        })
      ).toEqual([
        {
          languageName: "g1",
          typeName: "t1",
          type: "terminal",
          name: "a1",
          symbol: "t_a1",
        },
        {
          languageName: "g1",
          typeName: "t1",
          type: "property",
          name: "a2",
          base: "string",
        },
      ]);
    });

    it(`Two types, each one attribute`, () => {
      expect(
        getFullQualifiedAttributes({
          g1: {
            t1: {
              type: "concrete",
              attributes: [{ type: "terminal", name: "a1", symbol: "t_a1" }],
            },
            t2: {
              type: "concrete",
              attributes: [{ type: "property", name: "a1", base: "string" }],
            },
          },
        })
      ).toEqual([
        {
          languageName: "g1",
          typeName: "t1",
          type: "terminal",
          name: "a1",
          symbol: "t_a1",
        },
        {
          languageName: "g1",
          typeName: "t2",
          type: "property",
          name: "a1",
          base: "string",
        },
      ]);
    });

    it(`Two types, "oneOf" ignored`, () => {
      expect(
        getFullQualifiedAttributes({
          g1: {
            t1: {
              type: "concrete",
              attributes: [{ type: "terminal", name: "a1", symbol: "t_a1" }],
            },
            t2: {
              type: "oneOf",
              oneOf: [],
            },
          },
        })
      ).toEqual([
        {
          languageName: "g1",
          typeName: "t1",
          type: "terminal",
          name: "a1",
          symbol: "t_a1",
        },
      ]);
    });
  });

  describe(`getQualifiedTypes`, () => {
    it(`No languages`, () => {
      expect(getQualifiedTypes({})).toEqual([]);
    });

    it(`Empty language`, () => {
      expect(getQualifiedTypes({ g: {} })).toEqual([]);
    });

    it(`Single language`, () => {
      expect(
        getQualifiedTypes({
          g: {
            t1: {
              type: "concrete",
            },
          },
        })
      ).toEqual([{ type: "concrete", languageName: "g", typeName: "t1" }]);
    });

    it(`Two languages`, () => {
      expect(
        getQualifiedTypes({
          g1: {
            t1: { type: "concrete" },
          },
          g2: {
            t2: { type: "concrete" },
          },
        })
      ).toEqual([
        { type: "concrete", languageName: "g1", typeName: "t1" },
        { type: "concrete", languageName: "g2", typeName: "t2" },
      ]);
    });
  });

  describe(`getConcreteTypes`, () => {
    it(`g.t1`, () => {
      expect(
        getConcreteTypes({
          g: {
            t1: {
              type: "concrete",
            },
          },
        })
      ).toEqual([{ languageName: "g", typeName: "t1" }]);
    });

    it(`g.t1, g.t2`, () => {
      expect(
        getConcreteTypes({
          g: {
            t1: {
              type: "concrete",
            },
            t2: {
              type: "concrete",
            },
          },
        })
      ).toEqual([
        { languageName: "g", typeName: "t1" },
        { languageName: "g", typeName: "t2" },
      ]);
    });

    it(`g.t1, h.t1`, () => {
      expect(
        getConcreteTypes({
          g: {
            t1: {
              type: "concrete",
            },
          },
          h: {
            t1: {
              type: "concrete",
            },
          },
        })
      ).toEqual([
        { languageName: "g", typeName: "t1" },
        { languageName: "h", typeName: "t1" },
      ]);
    });

    it(`Omit typedef`, () => {
      expect(
        getConcreteTypes({
          g: {
            t1: {
              type: "oneOf",
              oneOf: [],
            },
            t2: {
              type: "concrete",
            },
          },
        })
      ).toEqual([{ languageName: "g", typeName: "t2" }]);
    });

    it(`Empty Types`, () => {
      expect(getConcreteTypes({})).toEqual([]);
    });
  });

  describe(`getFullQualifiedAttributes`, () => {
    it(`No languages`, () => {
      expect(getFullQualifiedAttributes({})).toEqual([]);
    });

    it(`Single language`, () => {
      expect(
        getFullQualifiedAttributes({
          g: {
            t1: {
              type: "concrete",
              attributes: [{ type: "property", name: "a", base: "string" }],
            },
          },
        })
      ).toEqual([
        {
          type: "property",
          name: "a",
          base: "string",
          languageName: "g",
          typeName: "t1",
        },
      ]);
    });

    it(`Two languages`, () => {
      expect(
        getFullQualifiedAttributes({
          g1: {
            t1: {
              type: "concrete",
              attributes: [{ type: "property", name: "a", base: "string" }],
            },
          },
          g2: {
            t1: {
              type: "concrete",
              attributes: [{ type: "property", name: "a", base: "string" }],
            },
          },
        })
      ).toEqual([
        {
          type: "property",
          name: "a",
          base: "string",
          languageName: "g1",
          typeName: "t1",
        },
        {
          type: "property",
          name: "a",
          base: "string",
          languageName: "g2",
          typeName: "t1",
        },
      ]);
    });

    it(`Container with attributes`, () => {
      expect(
        getFullQualifiedAttributes({
          g: {
            t1: {
              type: "concrete",
              attributes: [
                { type: "property", name: "top", base: "string" },
                {
                  type: "container",
                  orientation: "vertical",
                  children: [
                    { type: "property", name: "nested", base: "string" },
                  ],
                },
              ],
            },
          },
        })
      ).toEqual([
        {
          type: "property",
          name: "top",
          base: "string",
          languageName: "g",
          typeName: "t1",
        },
        jasmine.objectContaining({
          languageName: "g",
          typeName: "t1",
          type: "container",
          name: "container_1",
        }),
        {
          type: "property",
          name: "nested",
          base: "string",
          languageName: "g",
          typeName: "t1",
        },
      ]);
    });
  });

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
      const g: GrammarDocument = mkSingleLanguageGrammar("foo", "r", {
        t1: {
          type: "concrete",
          attributes: [],
        },
      });
      const r = orderTypes(g);
      expect(r).toEqual([{ languageName: "foo", typeName: "t1" }]);
    });

    it(`Only Root`, () => {
      const g: GrammarDocument = mkSingleLanguageGrammar("foo", "r", {
        r: {
          type: "concrete",
          attributes: [],
        },
      });

      const r = orderTypes(g);
      expect(r).toEqual([{ languageName: "foo", typeName: "r" }]);
    });

    it(`Root and one unreferenced type`, () => {
      const g: GrammarDocument = mkSingleLanguageGrammar("foo", "r", {
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
      const g: GrammarDocument = mkSingleLanguageGrammar("foo", "r", {
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
      const g: GrammarDocument = mkSingleLanguageGrammar("foo", "r", {
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
      const g: GrammarDocument = mkSingleLanguageGrammar("foo", "r", {
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
      const g: GrammarDocument = mkSingleLanguageGrammar("foo", "r", {
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
      const g: GrammarDocument = mkSingleLanguageGrammar("foo", "r", {
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
      const g: GrammarDocument = mkSingleLanguageGrammar("foo", "r", {
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
      const g: GrammarDocument = mkSingleLanguageGrammar("foo", "r", {
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
      const g: GrammarDocument = mkSingleLanguageGrammar("foo", "r", {
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
      const g: GrammarDocument = mkGrammarDoc(
        { languageName: "l", typeName: "root" },
        {
          foreignTypes: {
            l: {
              root: { type: "concrete", attributes: [] },
            },
          },
        }
      );

      const r = orderTypes(g);
      expect(r).toEqual([{ languageName: "l", typeName: "root" }]);
    });

    it(`Root is foreign type, references local type`, () => {
      const g: GrammarDocument = mkGrammarDoc(
        { languageName: "l", typeName: "root" },
        {
          types: {
            l: {
              t1: { type: "concrete", attributes: [] },
            },
          },
          foreignTypes: {
            l: {
              root: {
                type: "concrete",
                attributes: [
                  { type: "sequence", name: "n", nodeTypes: ["t1"] },
                ],
              },
            },
          },
        }
      );

      const r = orderTypes(g);
      expect(r).toEqual([
        { languageName: "l", typeName: "root" },
        { languageName: "l", typeName: "t1" },
      ]);
    });

    it(`Root is local type, references foreign type`, () => {
      const g: GrammarDocument = mkGrammarDoc(
        { languageName: "l", typeName: "root" },
        {
          types: {
            l: {
              root: {
                type: "concrete",
                attributes: [
                  { type: "sequence", name: "n", nodeTypes: ["t1"] },
                ],
              },
            },
          },
          foreignTypes: {
            l: {
              t1: { type: "concrete", attributes: [] },
            },
          },
        }
      );

      const r = orderTypes(g);
      expect(r).toEqual([
        { languageName: "l", typeName: "root" },
        { languageName: "l", typeName: "t1" },
      ]);
    });

    it(`Visual containers`, () => {
      const g: GrammarDocument = mkSingleLanguageGrammar("foo", "r", {
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
      const g: GrammarDocument = mkSingleLanguageGrammar("foo", "r", {
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

  describe(`Type subsets`, () => {
    const typeEmpty: NodeConcreteTypeDescription = {
      type: "concrete",
      attributes: [],
    };

    const typeVisualizeA: NodeVisualTypeDescription = {
      type: "visualise",
      attributes: [],
    };

    const typeVisualizeB: NodeVisualTypeDescription = {
      type: "visualise",
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

    describe(`No type keys at all`, () => {
      // Technically not legal, but should be tested anyway
      const g: GrammarDocument = {} as GrammarDocument;

      it(`allConcreteTypes`, () => {
        expect(allConcreteTypes(g)).toEqual({});
      });
      it(`allVisualizableTypes`, () => {
        expect(allVisualisableTypes(g)).toEqual({});
      });
    });

    describe(`No types at all`, () => {
      const g: GrammarDocument = mkTypeGrammarDoc({});

      it(`allConcreteTypes`, () => {
        expect(allConcreteTypes(g)).toEqual({});
      });
      it(`allVisualizableTypes`, () => {
        expect(allVisualisableTypes(g)).toEqual({});
      });
    });

    describe(`Empty local language`, () => {
      const g: GrammarDocument = mkTypeGrammarDoc({
        types: { l: {} },
        foreignTypes: {},
      });

      it(`allConcreteTypes`, () => {
        expect(allConcreteTypes(g)).toEqual({ l: {} });
      });
      it(`allVisualizableTypes`, () => {
        expect(allVisualisableTypes(g)).toEqual({ l: {} });
      });
    });

    describe(`Empty foreign language`, () => {
      const g: GrammarDocument = mkTypeGrammarDoc({
        types: {},
        foreignTypes: { l: {} },
      });

      it(`allConcreteTypes`, () => {
        expect(allConcreteTypes(g)).toEqual({ l: {} });
      });
      it(`allVisualizableTypes`, () => {
        expect(allVisualisableTypes(g)).toEqual({ l: {} });
      });
    });

    describe(`Identical empty foreign and local language`, () => {
      const g: GrammarDocument = mkTypeGrammarDoc({
        types: { l: {} },
        foreignTypes: { l: {} },
      });

      it(`allConcreteTypes`, () => {
        expect(allConcreteTypes(g)).toEqual({ l: {} });
      });
      it(`allVisualizableTypes`, () => {
        expect(allVisualisableTypes(g)).toEqual({ l: {} });
      });
    });

    describe(`Different empty foreign and local language`, () => {
      const g: GrammarDocument = mkTypeGrammarDoc({
        types: { l1: {} },
        foreignTypes: { l2: {} },
      });

      it(`allConcreteTypes`, () => {
        expect(allConcreteTypes(g)).toEqual({ l1: {}, l2: {} });
      });
      it(`allVisualizableTypes`, () => {
        expect(allVisualisableTypes(g)).toEqual({ l1: {}, l2: {} });
      });
    });

    describe(`Local language with single type`, () => {
      const g: GrammarDocument = mkTypeGrammarDoc({
        types: { l: { t: typeEmpty } },
      });

      it(`allConcreteTypes`, () => {
        expect(allConcreteTypes(g)).toEqual({ l: { t: typeEmpty } });
      });
      it(`allVisualizableTypes`, () => {
        expect(allVisualisableTypes(g)).toEqual({ l: { t: typeEmpty } });
      });
    });

    describe(`Local language with single visualization`, () => {
      const g: GrammarDocument = mkTypeGrammarDoc({
        visualisations: { l: { t: typeVisualizeA } },
      });

      it(`allConcreteTypes`, () => {
        expect(allConcreteTypes(g)).toEqual({});
      });
      it(`allVisualizableTypes`, () => {
        expect(allVisualisableTypes(g)).toEqual({ l: { t: typeVisualizeA } });
      });
    });

    describe(`Foreign language with single type`, () => {
      const g: GrammarDocument = mkTypeGrammarDoc({
        foreignTypes: { l: { t: typeEmpty } },
      });

      it(`allConcreteTypes`, () => {
        expect(allConcreteTypes(g)).toEqual({ l: { t: typeEmpty } });
      });
      it(`allVisualizableTypes`, () => {
        expect(allVisualisableTypes(g)).toEqual({ l: { t: typeEmpty } });
      });
    });

    describe(`Local and foreign language with identical single type`, () => {
      const g: GrammarDocument = mkTypeGrammarDoc({
        types: { l: { t: typeEmpty } },
        foreignTypes: { l: { t: typeEmpty } },
      });

      it(`allConcreteTypes`, () => {
        expect(allConcreteTypes(g)).toEqual({ l: { t: typeEmpty } });
      });
      it(`allVisualizableTypes`, () => {
        expect(allVisualisableTypes(g)).toEqual({ l: { t: typeEmpty } });
      });
    });

    describe(`Local precedence: Termninal a`, () => {
      const g: GrammarDocument = mkTypeGrammarDoc({
        types: { l: { t: typeTerminalA } },
        foreignTypes: { l: { t: typeEmpty } },
      });

      it(`allConcreteTypes`, () => {
        expect(allConcreteTypes(g)).toEqual({ l: { t: typeTerminalA } });
      });
      it(`allVisualizableTypes`, () => {
        expect(allVisualisableTypes(g)).toEqual({ l: { t: typeTerminalA } });
      });
    });

    describe(`Local precedence: Empty`, () => {
      const g: GrammarDocument = mkTypeGrammarDoc({
        types: { l: { t: typeEmpty } },
        foreignTypes: { l: { t: typeTerminalA } },
      });

      it(`allConcreteTypes`, () => {
        expect(allConcreteTypes(g)).toEqual({ l: { t: typeEmpty } });
      });
      it(`allVisualizableTypes`, () => {
        expect(allVisualisableTypes(g)).toEqual({ l: { t: typeEmpty } });
      });
    });

    it(`Local precedence: Termninal a, additional local`, () => {
      const g: GrammarDocument = mkTypeGrammarDoc({
        types: { l: { t1: typeTerminalA, t2: typeTerminalA } },
        foreignTypes: { l: { t1: typeEmpty } },
      });

      expect(allConcreteTypes(g)).toEqual({
        l: { t1: typeTerminalA, t2: typeTerminalA },
      });
    });

    describe(`Local precedence: Termninal a, additional foreign`, () => {
      const g: GrammarDocument = mkTypeGrammarDoc({
        types: { l: { t1: typeTerminalA } },
        foreignTypes: { l: { t1: typeEmpty, t2: typeTerminalA } },
      });

      it(`allConcreteTypes`, () => {
        expect(allConcreteTypes(g)).toEqual({
          l: { t1: typeTerminalA, t2: typeTerminalA },
        });
      });
      it(`allVisualizableTypes`, () => {
        expect(allVisualisableTypes(g)).toEqual({
          l: { t1: typeTerminalA, t2: typeTerminalA },
        });
      });
    });

    describe(`Foreign visualization has precedence over a type`, () => {
      const g: GrammarDocument = mkTypeGrammarDoc({
        types: { l: { t1: typeEmpty } },
        foreignVisualisations: { l: { t1: typeVisualizeA } },
      });

      it(`allConcreteTypes`, () => {
        expect(allConcreteTypes(g)).toEqual({
          l: { t1: typeEmpty },
        });
      });
      it(`allVisualizableTypes`, () => {
        expect(allVisualisableTypes(g)).toEqual({
          l: { t1: typeVisualizeA },
        });
      });
    });

    describe(`Local visualization has precedence over a type`, () => {
      const g: GrammarDocument = mkTypeGrammarDoc({
        types: { l: { t1: typeEmpty } },
        visualisations: { l: { t1: typeVisualizeA } },
      });

      it(`allConcreteTypes`, () => {
        expect(allConcreteTypes(g)).toEqual({
          l: { t1: typeEmpty },
        });
      });
      it(`allVisualizableTypes`, () => {
        expect(allVisualisableTypes(g)).toEqual({
          l: { t1: typeVisualizeA },
        });
      });
    });

    describe(`Local visualization has precedence over foreign visualization`, () => {
      const g: GrammarDocument = mkTypeGrammarDoc({
        foreignVisualisations: { l: { t1: typeVisualizeB } },
        visualisations: { l: { t1: typeVisualizeA } },
      });

      it(`allConcreteTypes`, () => {
        expect(allConcreteTypes(g)).toEqual({});
      });
      it(`allVisualizableTypes`, () => {
        expect(allVisualisableTypes(g)).toEqual({
          l: { t1: typeVisualizeA },
        });
      });
    });

    describe(`Filter`, () => {
      describe(`Local language with remaining non visual type`, () => {
        const g: GrammarDocument = mkTypeGrammarDoc({
          types: { l: { t2: typeEmpty } },
          visualisations: { l: { t1: { ...typeVisualizeA, tags: ["a"] } } },
        });

        const f = (t: NodeTypeDescription) =>
          !isNodeOneOfTypeDescription(t) && t.tags?.includes("a");

        it(`allConcreteTypes`, () => {
          expect(allConcreteTypes(g, f)).toEqual({ l: {} });
        });
        it(`allVisualizableTypes`, () => {
          expect(allVisualisableTypes(g, f)).toEqual({
            l: { t1: { ...typeVisualizeA, tags: ["a"] } },
          });
        });
      });
    });
  });
});
