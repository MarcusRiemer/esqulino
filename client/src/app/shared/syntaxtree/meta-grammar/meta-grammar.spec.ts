import {
  GrammarDocument,
  NodeTerminalSymbolDescription,
  NodeTypesSequenceDescription,
  NodeVisualContainerDescription,
} from "../grammar.description";
import { SyntaxNode } from "../syntaxtree";
import { NodeDescription } from "../syntaxtree.description";

import {
  readFromNode,
  convertProperty,
  convertTerminal,
  convertOccurs,
  convertNodeRefOne,
  convertInterpolate,
} from "./meta-grammar";

describe(`Convert Meta Grammar AST => GrammarDescription`, () => {
  describe(`Utility Functions`, () => {
    it(`property`, () => {
      const n = new SyntaxNode(
        {
          language: "MetaGrammar",
          name: "property",
          properties: {
            name: "prop1",
            base: "integer",
          },
        },
        undefined
      );

      expect(convertProperty(n)).toEqual({
        type: "property",
        base: "integer",
        name: "prop1",
      });
    });

    it(`interpolate`, () => {
      const n = new SyntaxNode(
        {
          language: "MetaGrammar",
          name: "interpolate",
          properties: {
            name: "prop1",
          },
        },
        undefined
      );

      expect(convertInterpolate(n)).toEqual({
        type: "interpolate",
        name: "prop1",
      });
    });

    it(`Named Terminal`, () => {
      const n = new SyntaxNode(
        {
          language: "MetaGrammar",
          name: "terminal",
          properties: {
            name: "t1",
            symbol: "t",
          },
        },
        undefined
      );

      expect(convertTerminal(n)).toEqual({
        type: "terminal",
        name: "t1",
        symbol: "t",
      });
    });

    it(`Unnamed Terminal`, () => {
      const n = new SyntaxNode(
        {
          language: "MetaGrammar",
          name: "terminal",
          properties: { symbol: "t" },
        },
        undefined
      );

      expect(convertTerminal(n)).toEqual({
        type: "terminal",
        symbol: "t",
      });
    });

    describe(`convertOccurs`, () => {
      const createKnownCardinality = (k: string) =>
        new SyntaxNode(
          {
            language: "MetaGrammar",
            name: "knownCardinality",
            properties: { cardinality: k },
          },
          undefined
        );

      it(`Node with "?"`, () => {
        expect(convertOccurs(createKnownCardinality("?"))).toEqual("?");
      });

      it(`Node with "*"`, () => {
        expect(convertOccurs(createKnownCardinality("*"))).toEqual("*");
      });

      it(`Node with "+"`, () => {
        expect(convertOccurs(createKnownCardinality("+"))).toEqual("+");
      });

      it(`Node with "!" (Invalid)`, () => {
        expect(() => convertOccurs(createKnownCardinality("!"))).toThrowError(
          /\!/
        );
      });

      it(`Node with undefined (Invalid)`, () => {
        expect(() =>
          convertOccurs(createKnownCardinality(undefined))
        ).toThrowError(/undefined/);
      });

      it(`Undefined node`, () => {
        expect(() => convertOccurs(undefined)).toThrowError(/convertOccurs/);
      });

      it(`mismatched node`, () => {
        const n = new SyntaxNode(
          {
            language: "MetaGrammar",
            name: "unrelated",
            properties: { cardinality: "*" },
          },
          undefined
        );
        expect(() => convertOccurs(n)).toThrowError(/convertOccurs/);
      });
    });

    describe(`convertNodeRefOne`, () => {
      const createNodeRefOne = (refLang: string, refName: string) => {
        const desc: NodeDescription = {
          language: "MetaGrammar",
          name: "nodeRefOne",
        };

        if (refLang || refName) {
          desc.properties = {};
        }

        if (refLang) {
          desc.properties["languageName"] = refLang;
        }

        if (refName) {
          desc.properties["typeName"] = refName;
        }
        return new SyntaxNode(desc, undefined);
      };

      it(`Node with "a"."b"`, () => {
        expect(convertNodeRefOne(createNodeRefOne("a", "b"))).toEqual({
          languageName: "a",
          typeName: "b",
        });
      });

      it(`Undefined node`, () => {
        expect(() => convertNodeRefOne(undefined)).toThrowError(
          /convertNodeRefOne/
        );
      });

      it(`mismatched node`, () => {
        const n = new SyntaxNode(
          {
            language: "MetaGrammar",
            name: "unrelated",
            properties: { cardinality: "*" },
          },
          undefined
        );
        expect(() => convertNodeRefOne(n)).toThrowError(/convertNodeRefOne/);
      });
    });
  });

  describe(`Whole Trees`, () => {
    it(`Only Root Node, no properties`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
        },
        true
      );

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        types: {},
        visualisations: {},
        foreignVisualisations: {},
      });
    });

    it(`Root Node with empty includes`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            includes: [
              {
                language: "MetaGrammar",
                name: "grammarIncludes",
                children: {
                  includes: [],
                },
              },
            ],
          },
        },
        true
      );

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
        types: {},
        includes: [],
      });
    });

    it(`Root Node with single include`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            includes: [
              {
                language: "MetaGrammar",
                name: "grammarIncludes",
                children: {
                  includes: [
                    {
                      language: "MetaGrammar",
                      name: "grammarRef",
                      properties: {
                        grammarId: "e495ac2f-9413-4fb7-8480-d7d807bfc59a",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        true
      );

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
        types: {},
        includes: ["e495ac2f-9413-4fb7-8480-d7d807bfc59a"],
      });
    });

    it(`Root Node with single visualization`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            includes: [
              {
                language: "MetaGrammar",
                name: "grammarVisualizes",
                children: {
                  includes: [
                    {
                      language: "MetaGrammar",
                      name: "grammarRef",
                      properties: {
                        grammarId: "e495ac2f-9413-4fb7-8480-d7d807bfc59a",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        true
      );

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
        types: {},
        includes: ["e495ac2f-9413-4fb7-8480-d7d807bfc59a"],
      });
    });

    it(`Root Node without types but with defined root type`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            root: [
              {
                language: "MetaGrammar",
                name: "nodeRef",
                properties: { languageName: "l", typeName: "t" },
              },
            ],
          },
        },
        true
      );

      expect(g).toEqual({
        root: { languageName: "l", typeName: "t" },
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
        types: {},
      });
    });

    it(`Empty grammar with comment`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            nodes: [
              {
                language: "MetaGrammar",
                name: "comment",
                properties: {
                  text: "this is a comment",
                },
              },
            ],
          },
        },
        true
      );

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
        types: {},
      });
    });

    it(`Empty concrete type with comment`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            nodes: [
              {
                language: "MetaGrammar",
                name: "concreteNode",
                properties: {
                  languageName: "l",
                  typeName: "t",
                },
                children: {
                  attributes: [
                    {
                      language: "MetaGrammar",
                      name: "comment",
                      properties: {
                        text: "this is a comment",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        true
      );

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
        types: { l: { t: { type: "concrete", attributes: [] } } },
      });
    });

    it(`Empty concrete type with tag`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            nodes: [
              {
                language: "MetaGrammar",
                name: "concreteNode",
                properties: {
                  languageName: "l",
                  typeName: "t",
                },
                children: {
                  tags: [
                    {
                      language: "MetaGrammar",
                      name: "tag",
                      properties: {
                        name: "t1",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        true
      );

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
        types: { l: { t: { type: "concrete", attributes: [], tags: ["t1"] } } },
      });
    });

    it(`Empty concrete type with multiple tags`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            nodes: [
              {
                language: "MetaGrammar",
                name: "concreteNode",
                properties: { languageName: "l", typeName: "t" },
                children: {
                  tags: [
                    {
                      language: "MetaGrammar",
                      name: "tag",
                      properties: { name: "t1" },
                    },
                    {
                      language: "MetaGrammar",
                      name: "tag",
                      properties: { name: "t2" },
                    },
                  ],
                },
              },
            ],
          },
        },
        true
      );

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
        types: {
          l: { t: { type: "concrete", attributes: [], tags: ["t1", "t2"] } },
        },
      });
    });

    it(`Duplicate empty concrete type`, () => {
      const n: NodeDescription = {
        language: "MetaGrammar",
        name: "grammar",
        children: {
          nodes: [
            {
              language: "MetaGrammar",
              name: "concreteNode",
              properties: {
                languageName: "l",
                typeName: "t",
              },
            },
            {
              language: "MetaGrammar",
              name: "concreteNode",
              properties: {
                languageName: "l",
                typeName: "t",
              },
            },
          ],
        },
      };

      expect(() => readFromNode(n, true)).toThrowError();
    });

    it(`Empty concrete type without languageName`, () => {
      const n: NodeDescription = {
        language: "MetaGrammar",
        name: "grammar",
        children: {
          nodes: [
            {
              language: "MetaGrammar",
              name: "concreteNode",
              properties: {
                typeName: "t",
              },
              children: {
                attributes: [
                  {
                    language: "MetaGrammar",
                    name: "comment",
                    properties: {
                      text: "this is a comment",
                    },
                  },
                ],
              },
            },
          ],
        },
      };

      expect(() => readFromNode(n, true)).toThrowError();
    });

    it(`Empty concrete type without typeName`, () => {
      const n: NodeDescription = {
        language: "MetaGrammar",
        name: "grammar",
        children: {
          nodes: [
            {
              language: "MetaGrammar",
              name: "concreteNode",
              properties: {
                languageName: "l",
              },
              children: {
                attributes: [
                  {
                    language: "MetaGrammar",
                    name: "comment",
                    properties: {
                      text: "this is a comment",
                    },
                  },
                ],
              },
            },
          ],
        },
      };

      expect(() => readFromNode(n, true)).toThrowError();
    });

    it(`Empty concrete type in single language`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            nodes: [
              {
                language: "MetaGrammar",
                name: "concreteNode",
                properties: {
                  languageName: "l",
                  typeName: "t",
                },
                children: {
                  attributes: [],
                },
              },
            ],
          },
        },
        true
      );

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
        types: {
          l: { t: { type: "concrete", attributes: [] } },
        },
      });
    });

    it(`Empty visualization in single language`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            nodes: [
              {
                language: "MetaGrammar",
                name: "visualizeNode",
                children: {
                  references: [
                    {
                      name: "nodeRefOne",
                      language: "MetaGrammar",
                      properties: {
                        typeName: "t",
                        languageName: "l",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        true
      );

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        visualisations: { l: { t: { type: "visualise", attributes: [] } } },
        foreignVisualisations: {},
        types: {},
      });
    });

    it(`Interpolate visualization in single language`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            nodes: [
              {
                language: "MetaGrammar",
                name: "visualizeNode",
                children: {
                  references: [
                    {
                      name: "nodeRefOne",
                      language: "MetaGrammar",
                      properties: {
                        typeName: "t",
                        languageName: "l",
                      },
                    },
                  ],
                  attributes: [
                    {
                      language: "MetaGrammar",
                      name: "interpolate",
                      properties: {
                        name: "s",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        true
      );

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        visualisations: {
          l: {
            t: {
              type: "visualise",
              attributes: [{ type: "interpolate", name: "s" }],
            },
          },
        },
        foreignVisualisations: {},
        types: {},
      });
    });

    it(`Type with visualization`, () => {
      const g: GrammarDocument = readFromNode(
        {
          name: "grammar",
          language: "MetaGrammar",
          properties: {
            name: "vis",
          },
          children: {
            root: [
              {
                name: "nodeRefOne",
                language: "MetaGrammar",
                properties: {
                  typeName: "root",
                  languageName: "vis",
                },
              },
            ],
            nodes: [
              {
                name: "concreteNode",
                language: "MetaGrammar",
                properties: {
                  typeName: "root",
                  languageName: "vis",
                },
                children: {
                  attributes: [
                    {
                      name: "property",
                      language: "MetaGrammar",
                      properties: {
                        base: "integer",
                        name: "count",
                      },
                    },
                  ],
                },
              },
              {
                name: "visualizeNode",
                language: "MetaGrammar",
                children: {
                  references: [
                    {
                      name: "nodeRefOne",
                      language: "MetaGrammar",
                      properties: {
                        typeName: "root",
                        languageName: "vis",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        true
      );

      expect(g).toEqual({
        types: {
          vis: {
            root: {
              type: "concrete",
              attributes: [
                {
                  type: "property",
                  base: "integer",
                  name: "count",
                },
              ],
            },
          },
        },
        foreignTypes: {},
        visualisations: {
          vis: {
            root: {
              type: "visualise",
              attributes: [],
            },
          },
        },
        foreignVisualisations: {},
        root: {
          languageName: "vis",
          typeName: "root",
        },
      });
    });

    it(`each visualization in single language`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            nodes: [
              {
                language: "MetaGrammar",
                name: "visualizeNode",
                children: {
                  references: [
                    {
                      name: "nodeRefOne",
                      language: "MetaGrammar",
                      properties: {
                        typeName: "t",
                        languageName: "l",
                      },
                    },
                  ],
                  attributes: [
                    {
                      language: "MetaGrammar",
                      name: "each",
                      properties: {
                        name: "s",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        true
      );

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        visualisations: {
          l: {
            t: {
              type: "visualise",
              attributes: [{ type: "each", name: "s" }],
            },
          },
        },
        foreignVisualisations: {},
        types: {},
      });
    });

    it(`oneOf for two non-existant types`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            nodes: [
              {
                language: "MetaGrammar",
                name: "typedef",
                properties: {
                  languageName: "l",
                  typeName: "t",
                },
                children: {
                  references: [
                    {
                      language: "MetaGrammar",
                      name: "nodeRefOne",
                      properties: {
                        languageName: "l",
                        typeName: "a1",
                      },
                    },
                    {
                      language: "MetaGrammar",
                      name: "nodeRefOne",
                      properties: {
                        languageName: "q",
                        typeName: "a2",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        true
      );

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
        types: {
          l: {
            t: {
              type: "oneOf",
              oneOf: [
                { languageName: "l", typeName: "a1" },
                { languageName: "q", typeName: "a2" },
              ],
            },
          },
        },
      });
    });

    it(`Empty concrete type in two languages`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            nodes: [
              {
                language: "MetaGrammar",
                name: "concreteNode",
                properties: {
                  languageName: "l1",
                  typeName: "t",
                },
                children: {
                  attributes: [],
                },
              },
              {
                language: "MetaGrammar",
                name: "concreteNode",
                properties: {
                  languageName: "l2",
                  typeName: "t",
                },
                children: {
                  attributes: [],
                },
              },
            ],
          },
        },
        true
      );

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
        types: {
          l1: { t: { type: "concrete", attributes: [] } },
          l2: { t: { type: "concrete", attributes: [] } },
        },
      });
    });

    it(`Type with single terminal`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            nodes: [
              {
                language: "MetaGrammar",
                name: "concreteNode",
                properties: {
                  languageName: "l",
                  typeName: "t",
                },
                children: {
                  attributes: [
                    {
                      language: "MetaGrammar",
                      name: "terminal",
                      properties: {
                        symbol: "s",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        true
      );

      const terminalDesc: NodeTerminalSymbolDescription = {
        type: "terminal",
        symbol: "s",
      };

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
        types: {
          l: { t: { type: "concrete", attributes: [terminalDesc] } },
        },
      });
    });

    it(`Type with single property`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            nodes: [
              {
                language: "MetaGrammar",
                name: "concreteNode",
                properties: {
                  languageName: "l",
                  typeName: "t",
                },
                children: {
                  attributes: [
                    {
                      language: "MetaGrammar",
                      name: "terminal",
                      properties: {
                        symbol: "s",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        true
      );

      const terminalDesc: NodeTerminalSymbolDescription = {
        type: "terminal",
        symbol: "s",
      };

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
        types: {
          l: { t: { type: "concrete", attributes: [terminalDesc] } },
        },
      });
    });

    it(`Type with single, empty sequence`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            nodes: [
              {
                language: "MetaGrammar",
                name: "concreteNode",
                properties: {
                  languageName: "l",
                  typeName: "t",
                },
                children: {
                  attributes: [
                    {
                      language: "MetaGrammar",
                      name: "children",
                      properties: {
                        base: "sequence",
                        name: "seq",
                      },
                      children: {},
                    },
                  ],
                },
              },
            ],
          },
        },
        true
      );

      const seqDesc: NodeTypesSequenceDescription = {
        type: "sequence",
        name: "seq",
        nodeTypes: [],
      };

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
        types: {
          l: { t: { type: "concrete", attributes: [seqDesc] } },
        },
      });
    });

    it(`Type with single, empty sequence (with "soft-hole" tag)`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            nodes: [
              {
                language: "MetaGrammar",
                name: "concreteNode",
                properties: {
                  languageName: "l",
                  typeName: "t",
                },
                children: {
                  attributes: [
                    {
                      language: "MetaGrammar",
                      name: "children",
                      properties: {
                        base: "sequence",
                        name: "seq",
                      },
                      children: {
                        tags: [
                          {
                            language: "MetaGrammar",
                            name: "tag",
                            properties: {
                              name: "soft-hole",
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        true
      );

      const seqDesc: NodeTypesSequenceDescription = {
        type: "sequence",
        name: "seq",
        nodeTypes: [],
        tags: ["soft-hole"],
      };

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
        types: {
          l: { t: { type: "concrete", attributes: [seqDesc] } },
        },
      });
    });

    it(`Type with single, empty sequence in container`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            nodes: [
              {
                language: "MetaGrammar",
                name: "concreteNode",
                properties: {
                  languageName: "l",
                  typeName: "t",
                },
                children: {
                  attributes: [
                    {
                      language: "MetaGrammar",
                      name: "container",
                      children: {
                        orientation: [
                          {
                            language: "MetaGrammar",
                            name: "orientation",
                            properties: {
                              orientation: "vertical",
                            },
                          },
                        ],
                        attributes: [
                          {
                            language: "MetaGrammar",
                            name: "children",
                            properties: {
                              base: "sequence",
                              name: "seq",
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        true
      );

      const containerDesc: NodeVisualContainerDescription = {
        type: "container",
        children: [
          {
            type: "sequence",
            name: "seq",
            nodeTypes: [],
          },
        ],
        orientation: "vertical",
      };

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
        types: {
          l: { t: { type: "concrete", attributes: [containerDesc] } },
        },
      });
    });

    it(`Type with empty container with indent-tags`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            nodes: [
              {
                language: "MetaGrammar",
                name: "concreteNode",
                properties: {
                  languageName: "l",
                  typeName: "t",
                },
                children: {
                  attributes: [
                    {
                      language: "MetaGrammar",
                      name: "container",
                      children: {
                        orientation: [
                          {
                            language: "MetaGrammar",
                            name: "orientation",
                            properties: {
                              orientation: "horizontal",
                            },
                          },
                        ],
                        attributes: [],
                        tags: [
                          {
                            language: "MetaGrammar",
                            name: "tag",
                            properties: {
                              name: "t1",
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        true
      );

      const containerDesc: NodeVisualContainerDescription = {
        type: "container",
        children: [],
        tags: ["t1"],
        orientation: "horizontal",
      };

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
        types: {
          l: { t: { type: "concrete", attributes: [containerDesc] } },
        },
      });
    });

    it(`Type with single sequence that references a single type`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            nodes: [
              {
                language: "MetaGrammar",
                name: "concreteNode",
                properties: {
                  languageName: "l",
                  typeName: "t",
                },
                children: {
                  attributes: [
                    {
                      language: "MetaGrammar",
                      name: "children",
                      properties: {
                        base: "sequence",
                        name: "seq",
                      },
                      children: {
                        references: [
                          {
                            language: "MetaGrammar",
                            name: "nodeRefOne",
                            properties: {
                              languageName: "l",
                              typeName: "t",
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        true
      );

      const seqDesc: NodeTypesSequenceDescription = {
        type: "sequence",
        name: "seq",
        nodeTypes: [{ languageName: "l", typeName: "t" }],
      };

      expect(g).toEqual({
        root: undefined,
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
        types: {
          l: { t: { type: "concrete", attributes: [seqDesc] } },
        },
      });
    });

    it(`Type with single sequence that references a single type with a specified cardinality`, () => {
      const g: GrammarDocument = readFromNode(
        {
          language: "MetaGrammar",
          name: "grammar",
          children: {
            nodes: [
              {
                language: "MetaGrammar",
                name: "concreteNode",
                properties: {
                  languageName: "l",
                  typeName: "t",
                },
                children: {
                  attributes: [
                    {
                      language: "MetaGrammar",
                      name: "children",
                      properties: {
                        base: "sequence",
                        name: "seq",
                      },
                      children: {
                        references: [
                          {
                            language: "MetaGrammar",
                            name: "nodeRefCardinality",
                            children: {
                              references: [
                                {
                                  language: "MetaGrammar",
                                  name: "nodeRefOne",
                                  properties: {
                                    languageName: "l",
                                    typeName: "t",
                                  },
                                },
                              ],
                              cardinality: [
                                {
                                  language: "MetaGrammar",
                                  name: "knownCardinality",
                                  properties: {
                                    cardinality: "?",
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        true
      );

      const seqDesc: NodeTypesSequenceDescription = {
        type: "sequence",
        name: "seq",
        nodeTypes: [
          {
            occurs: "?",
            nodeType: { languageName: "l", typeName: "t" },
          },
        ],
      };

      expect(g).toEqual({
        root: undefined,
        visualisations: {},
        foreignVisualisations: {},
        foreignTypes: {},
        types: {
          l: { t: { type: "concrete", attributes: [seqDesc] } },
        },
      });
    });
  });
});
