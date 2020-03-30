import {
  resolveChildOccurs,
  isHoleIfEmpty,
  getFullQualifiedAttributes,
  getConcreteTypes,
  ensureGrammarAttributeNames,
  getQualifiedTypes,
} from "./grammar-util";
import {
  NodeTypeDescription,
  GrammarDocument,
  NodeConcreteTypeDescription,
  NodeOneOfTypeDescription,
} from "./grammar.description";

import { singleLanguageGrammar } from "./grammar.spec-util";

describe(`Grammar Utilities`, () => {
  describe(`Ensuring attribute names`, () => {
    it(`Single terminal`, () => {
      const g = singleLanguageGrammar("spec", "root", {
        root: {
          type: "concrete",
          attributes: [{ type: "terminal", symbol: "t" }],
        },
      });

      const named = ensureGrammarAttributeNames(g);
      const root = named.types["spec"]["root"] as NodeConcreteTypeDescription;

      expect(root.attributes).toEqual([
        { type: "terminal", symbol: "t", name: "terminal_0" },
      ]);
    });

    it(`Terminals and properties mixed`, () => {
      const g = singleLanguageGrammar("spec", "root", {
        root: {
          type: "concrete",
          attributes: [
            { type: "terminal", symbol: "t1" },
            { type: "property", base: "integer", name: "p" },
            { type: "terminal", symbol: "t2" },
          ],
        },
      });

      const named = ensureGrammarAttributeNames(g);
      const root = named.types["spec"]["root"] as NodeConcreteTypeDescription;

      expect(root.attributes).toEqual([
        { type: "terminal", symbol: "t1", name: "terminal_0" },
        { type: "property", base: "integer", name: "p" },
        { type: "terminal", symbol: "t2", name: "terminal_2" },
      ]);
    });

    it(`oneOf doesn't have names and must remain unchanged`, () => {
      const g = singleLanguageGrammar("spec", "root", {
        root: {
          type: "oneOf",
          oneOf: ["a", "b"],
        },
      });

      const named = ensureGrammarAttributeNames(g);
      const processed = named.types["spec"]["root"] as NodeOneOfTypeDescription;
      const original = g.types["spec"]["root"] as NodeOneOfTypeDescription;

      expect(processed).toEqual(original);
    });

    it(`Single unnamed container`, () => {
      const g = singleLanguageGrammar("spec", "root", {
        root: {
          type: "concrete",
          attributes: [
            { type: "container", orientation: "horizontal", children: [] },
          ],
        },
      });

      const named = ensureGrammarAttributeNames(g);
      const root = named.types["spec"]["root"] as NodeConcreteTypeDescription;

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
      const g = singleLanguageGrammar("spec", "root", {
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
      });

      const named = ensureGrammarAttributeNames(g);
      const root = named.types["spec"]["root"] as NodeConcreteTypeDescription;

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
      const g = singleLanguageGrammar("spec", "root", {
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
      });

      const named = ensureGrammarAttributeNames(g);
      const root = named.types["spec"]["root"] as NodeConcreteTypeDescription;

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
      const g = singleLanguageGrammar("spec", "root", {
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
      });

      const named = ensureGrammarAttributeNames(g);
      const root = named.types["spec"]["root"] as NodeConcreteTypeDescription;

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
      const g = singleLanguageGrammar("spec", "root", {
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
      });

      const named = ensureGrammarAttributeNames(g);
      const root = named.types["spec"]["root"] as NodeConcreteTypeDescription;

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

  describe(`resolveOccurs`, () => {
    it(`t1 | g1.t1 => 1`, () => {
      expect(resolveChildOccurs("a")).toEqual({ minOccurs: 1, maxOccurs: 1 });
    });

    it(`t1* | g1.t1* => 0..Inf`, () => {
      expect(resolveChildOccurs({ nodeType: "t1", occurs: "*" })).toEqual({
        minOccurs: 0,
        maxOccurs: +Infinity,
      });

      expect(
        resolveChildOccurs({
          nodeType: { languageName: "g1", typeName: "t1" },
          occurs: "*",
        })
      ).toEqual({ minOccurs: 0, maxOccurs: +Infinity });
    });

    it(`t1+ | g1.t1+ => 1..Inf`, () => {
      expect(resolveChildOccurs({ nodeType: "t1", occurs: "*" })).toEqual({
        minOccurs: 0,
        maxOccurs: +Infinity,
      });

      expect(
        resolveChildOccurs({
          nodeType: { languageName: "g1", typeName: "t1" },
          occurs: "*",
        })
      ).toEqual({ minOccurs: 0, maxOccurs: +Infinity });
    });

    it(`t1? | g1.t1? => 0..1`, () => {
      expect(resolveChildOccurs({ nodeType: "t1", occurs: "?" })).toEqual({
        minOccurs: 0,
        maxOccurs: 1,
      });

      expect(
        resolveChildOccurs({
          nodeType: { languageName: "g1", typeName: "t1" },
          occurs: "?",
        })
      ).toEqual({ minOccurs: 0, maxOccurs: 1 });
    });

    it(`t1{3,5} | g1.t1{3,5} => 3..5`, () => {
      expect(
        resolveChildOccurs({
          nodeType: "t1",
          occurs: { minOccurs: 3, maxOccurs: 5 },
        })
      ).toEqual({ minOccurs: 3, maxOccurs: 5 });

      expect(
        resolveChildOccurs({
          nodeType: { languageName: "g1", typeName: "t1" },
          occurs: { minOccurs: 3, maxOccurs: 5 },
        })
      ).toEqual({ minOccurs: 3, maxOccurs: 5 });
    });
  });

  describe(`isHoleIfEmpty`, () => {
    it(`Sequence: t1`, () => {
      expect(
        isHoleIfEmpty({
          type: "sequence",
          name: "a1",
          nodeTypes: ["t1"],
        })
      ).toBe(true);
    });

    it(`Sequence: t1? t2?`, () => {
      expect(
        isHoleIfEmpty({
          type: "sequence",
          name: "a1",
          nodeTypes: [
            { nodeType: "t1", occurs: "?" },
            { nodeType: "t2", occurs: "?" },
          ],
        })
      ).toBe(false);
    });

    it(`Allowed: t1`, () => {
      expect(
        isHoleIfEmpty({
          type: "allowed",
          name: "a1",
          nodeTypes: ["t1"],
        })
      ).toBe(true);
    });

    it(`Allowed: t1? t2?`, () => {
      expect(
        isHoleIfEmpty({
          type: "allowed",
          name: "a1",
          nodeTypes: [
            { nodeType: "t1", occurs: "?" },
            { nodeType: "t2", occurs: "?" },
          ],
        })
      ).toBe(false);
    });

    it(`choice`, () => {
      expect(
        isHoleIfEmpty({
          type: "choice",
          name: "a1",
          choices: [
            { languageName: "g", typeName: "t1" },
            { languageName: "g", typeName: "t2" },
          ],
        })
      ).toBe(true);
    });
  });

  describe(`getAttributes`, () => {
    // Shorthand to generate a grammar with the relevant properties
    const testGrammar = (
      name: string,
      types: { [nodeName: string]: NodeTypeDescription }
    ) => {
      const g: GrammarDocument = {
        root: undefined,
        types: {},
      };

      g.types[name] = types;
      return g;
    };

    it(`Empty Grammar`, () => {
      const g = testGrammar("g1", {});
      expect(getFullQualifiedAttributes(g)).toEqual([]);
    });

    it(`Single type, single attribute`, () => {
      const g = testGrammar("g1", {
        t1: {
          type: "concrete",
          attributes: [{ type: "terminal", name: "a1", symbol: "t_a1" }],
        },
      });
      expect(getFullQualifiedAttributes(g)).toEqual([
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
      const g = testGrammar("g1", {
        t1: {
          type: "concrete",
          attributes: [
            { type: "terminal", name: "a1", symbol: "t_a1" },
            { type: "property", name: "a2", base: "string" },
          ],
        },
      });
      expect(getFullQualifiedAttributes(g)).toEqual([
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
      const g = testGrammar("g1", {
        t1: {
          type: "concrete",
          attributes: [{ type: "terminal", name: "a1", symbol: "t_a1" }],
        },
        t2: {
          type: "concrete",
          attributes: [{ type: "property", name: "a1", base: "string" }],
        },
      });
      expect(getFullQualifiedAttributes(g)).toEqual([
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
      const g = testGrammar("g1", {
        t1: {
          type: "concrete",
          attributes: [{ type: "terminal", name: "a1", symbol: "t_a1" }],
        },
        t2: {
          type: "oneOf",
          oneOf: [],
        },
      });
      expect(getFullQualifiedAttributes(g)).toEqual([
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
      const g: GrammarDocument = {
        root: { languageName: "g", typeName: "t1" },
        types: {},
      };

      expect(getQualifiedTypes(g)).toEqual([]);
    });

    it(`Empty language`, () => {
      const g: GrammarDocument = {
        root: { languageName: "g", typeName: "t1" },
        types: {
          g: {},
        },
      };

      expect(getQualifiedTypes(g)).toEqual([]);
    });

    it(`Single language`, () => {
      const g: GrammarDocument = {
        root: { languageName: "g", typeName: "t1" },
        types: {
          g: {
            t1: {
              type: "concrete",
            },
          },
        },
      };

      expect(getQualifiedTypes(g)).toEqual([
        { type: "concrete", languageName: "g", typeName: "t1" },
      ]);
    });

    it(`Two languages`, () => {
      const g: GrammarDocument = {
        root: { languageName: "g", typeName: "t1" },
        types: {
          g1: {
            t1: { type: "concrete" },
          },
          g2: {
            t2: { type: "concrete" },
          },
        },
      };

      expect(getQualifiedTypes(g)).toEqual([
        { type: "concrete", languageName: "g1", typeName: "t1" },
        { type: "concrete", languageName: "g2", typeName: "t2" },
      ]);
    });
  });

  describe(`getConcreteTypes`, () => {
    it(`g.t1`, () => {
      const g: GrammarDocument = {
        root: { languageName: "g", typeName: "t1" },
        types: {
          g: {
            t1: {
              type: "concrete",
            },
          },
        },
      };

      expect(getConcreteTypes(g)).toEqual([
        { languageName: "g", typeName: "t1" },
      ]);
    });

    it(`g.t1, g.t2`, () => {
      const g: GrammarDocument = {
        root: { languageName: "g", typeName: "t1" },
        types: {
          g: {
            t1: {
              type: "concrete",
            },
            t2: {
              type: "concrete",
            },
          },
        },
      };

      expect(getConcreteTypes(g)).toEqual([
        { languageName: "g", typeName: "t1" },
        { languageName: "g", typeName: "t2" },
      ]);
    });

    it(`g.t1, h.t1`, () => {
      const g: GrammarDocument = {
        root: { languageName: "g", typeName: "t1" },
        types: {
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
        },
      };

      expect(getConcreteTypes(g)).toEqual([
        { languageName: "g", typeName: "t1" },
        { languageName: "h", typeName: "t1" },
      ]);
    });

    it(`Omit typedef`, () => {
      const g: GrammarDocument = {
        root: { languageName: "g", typeName: "t1" },
        types: {
          g: {
            t1: {
              type: "oneOf",
              oneOf: [],
            },
            t2: {
              type: "concrete",
            },
          },
        },
      };

      expect(getConcreteTypes(g)).toEqual([
        { languageName: "g", typeName: "t2" },
      ]);
    });

    it(`Missing Types`, () => {
      const g: GrammarDocument = {
        root: { languageName: "g", typeName: "t1" },
        types: undefined,
      };

      expect(getConcreteTypes(g)).toEqual([]);
    });

    it(`Empty Types`, () => {
      const g: GrammarDocument = {
        root: { languageName: "g", typeName: "t1" },
        types: {},
      };

      expect(getConcreteTypes(g)).toEqual([]);
    });
  });

  describe(`getFullQualifiedAttributes`, () => {
    it(`No languages`, () => {
      const g: GrammarDocument = {
        root: { languageName: "g", typeName: "t1" },
        types: {},
      };

      expect(getFullQualifiedAttributes(g)).toEqual([]);
    });

    it(`Single language`, () => {
      const g: GrammarDocument = {
        root: { languageName: "g", typeName: "t1" },
        types: {
          g: {
            t1: {
              type: "concrete",
              attributes: [{ type: "property", name: "a", base: "string" }],
            },
          },
        },
      };

      expect(getFullQualifiedAttributes(g)).toEqual([
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
      const g: GrammarDocument = {
        root: { languageName: "g", typeName: "t1" },
        types: {
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
        },
      };

      expect(getFullQualifiedAttributes(g)).toEqual([
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
      const g: GrammarDocument = {
        root: { languageName: "g", typeName: "t1" },
        types: {
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
        },
      };

      expect(getFullQualifiedAttributes(g)).toEqual([
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
});
