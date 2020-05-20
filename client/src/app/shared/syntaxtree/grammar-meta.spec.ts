import {
  GrammarDocument,
  NodeTerminalSymbolDescription,
  NodeTypesSequenceDescription,
  NodeVisualContainerDescription,
} from "./grammar.description";
import {
  readFromNode,
  convertProperty,
  convertTerminal,
  convertOccurs,
  convertNodeRefOne,
} from "./grammar-meta";
import { Node } from "./syntaxtree";
import { NodeDescription } from "./syntaxtree.description";

describe(`Convert Meta Grammar AST => GrammarDescription`, () => {
  describe(`Utility Functions`, () => {
    it(`Property`, () => {
      const n = new Node(
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

    it(`Named Terminal`, () => {
      const n = new Node(
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
      const n = new Node(
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
        new Node(
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
        const n = new Node(
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
        return new Node(desc, undefined);
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
        const n = new Node(
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
      const g: GrammarDocument = readFromNode({
        language: "MetaGrammar",
        name: "grammar",
      });

      expect(g).toEqual({
        root: undefined,
        types: {},
      });
    });

    it(`Root Node without types but with defined root type`, () => {
      const g: GrammarDocument = readFromNode({
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
      });

      expect(g).toEqual({
        root: { languageName: "l", typeName: "t" },
        types: {},
      });
    });

    it(`Empty grammar with comment`, () => {
      const g: GrammarDocument = readFromNode({
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
      });

      expect(g).toEqual({
        root: undefined,
        types: {},
      });
    });

    it(`Empty concrete type with comment`, () => {
      const g: GrammarDocument = readFromNode({
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
      });

      expect(g).toEqual({
        root: undefined,
        types: { l: { t: { type: "concrete", attributes: [] } } },
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

      expect(() => readFromNode(n)).toThrowError();
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

      expect(() => readFromNode(n)).toThrowError();
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

      expect(() => readFromNode(n)).toThrowError();
    });

    it(`Empty concrete type in single language`, () => {
      const g: GrammarDocument = readFromNode({
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
      });

      expect(g).toEqual({
        root: undefined,
        types: {
          l: { t: { type: "concrete", attributes: [] } },
        },
      });
    });

    it(`oneOf for two non-existant types`, () => {
      const g: GrammarDocument = readFromNode({
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
      });

      expect(g).toEqual({
        root: undefined,
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
      const g: GrammarDocument = readFromNode({
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
      });

      expect(g).toEqual({
        root: undefined,
        types: {
          l1: { t: { type: "concrete", attributes: [] } },
          l2: { t: { type: "concrete", attributes: [] } },
        },
      });
    });

    it(`Type with single terminal`, () => {
      const g: GrammarDocument = readFromNode({
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
      });

      const terminalDesc: NodeTerminalSymbolDescription = {
        type: "terminal",
        symbol: "s",
      };

      expect(g).toEqual({
        root: undefined,
        types: {
          l: { t: { type: "concrete", attributes: [terminalDesc] } },
        },
      });
    });

    it(`Type with single property`, () => {
      const g: GrammarDocument = readFromNode({
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
      });

      const terminalDesc: NodeTerminalSymbolDescription = {
        type: "terminal",
        symbol: "s",
      };

      expect(g).toEqual({
        root: undefined,
        types: {
          l: { t: { type: "concrete", attributes: [terminalDesc] } },
        },
      });
    });

    it(`Type with single, empty sequence`, () => {
      const g: GrammarDocument = readFromNode({
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
      });

      const seqDesc: NodeTypesSequenceDescription = {
        type: "sequence",
        name: "seq",
        nodeTypes: [],
      };

      expect(g).toEqual({
        root: undefined,
        types: {
          l: { t: { type: "concrete", attributes: [seqDesc] } },
        },
      });
    });

    it(`Type with single, empty sequence in container`, () => {
      const g: GrammarDocument = readFromNode({
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
      });

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
        types: {
          l: { t: { type: "concrete", attributes: [containerDesc] } },
        },
      });
    });

    it(`Type with single sequence that references a single type`, () => {
      const g: GrammarDocument = readFromNode({
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
      });

      const seqDesc: NodeTypesSequenceDescription = {
        type: "sequence",
        name: "seq",
        nodeTypes: [{ languageName: "l", typeName: "t" }],
      };

      expect(g).toEqual({
        root: undefined,
        types: {
          l: { t: { type: "concrete", attributes: [seqDesc] } },
        },
      });
    });

    it(`Type with single sequence that references a single type with a specified cardinality`, () => {
      const g: GrammarDocument = readFromNode({
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
      });

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
        types: {
          l: { t: { type: "concrete", attributes: [seqDesc] } },
        },
      });
    });
  });
});
