import { GrammarDocument, readFromNode, NodeTerminalSymbolDescription } from "./grammar.description";

describe(`Convert AST => GrammarDescription`, () => {
  it(`Only Root Node, no properties`, () => {
    const g: GrammarDocument = readFromNode({
      language: "meta",
      name: "grammar"
    });

    expect(g).toEqual({
      root: undefined,
      types: {},
    });
  });

  it(`Root Node without types but with defined root type`, () => {
    const g: GrammarDocument = readFromNode({
      language: "meta",
      name: "grammar",
      children: {
        "root": [
          { language: "meta", name: "nodeRef", properties: { "languageName": "l", "typeName": "t" } }
        ]
      }
    });

    expect(g).toEqual({
      root: { languageName: "l", typeName: "t" },
      types: {},
    });
  });

  it(`Empty concrete type in single language`, () => {
    const g: GrammarDocument = readFromNode({
      language: "meta",
      name: "grammar",
      children: {
        "nodes": [
          {
            language: "meta",
            name: "concreteNode",
            properties: {
              "languageName": "l",
              "typeName": "t"
            },
            children: {
              "attributes": []
            }
          }
        ]
      }
    });

    expect(g).toEqual({
      root: undefined,
      types: {
        "l": { "t": { type: "concrete", attributes: [] } }
      }
    });
  });

  it(`Empty concrete type in two languages`, () => {
    const g: GrammarDocument = readFromNode({
      language: "meta",
      name: "grammar",
      children: {
        "nodes": [
          {
            language: "meta",
            name: "concreteNode",
            properties: {
              "languageName": "l1",
              "typeName": "t"
            },
            children: {
              "attributes": []
            }
          },
          {
            language: "meta",
            name: "concreteNode",
            properties: {
              "languageName": "l2",
              "typeName": "t"
            },
            children: {
              "attributes": []
            }
          }
        ]
      }
    });

    expect(g).toEqual({
      root: undefined,
      types: {
        "l1": { "t": { type: "concrete", attributes: [] } },
        "l2": { "t": { type: "concrete", attributes: [] } }
      }
    });
  });

  it(`Type with single terminal`, () => {
    const g: GrammarDocument = readFromNode({
      language: "meta",
      name: "grammar",
      children: {
        "nodes": [
          {
            language: "meta",
            name: "concreteNode",
            properties: {
              "languageName": "l",
              "typeName": "t"
            },
            children: {
              "attributes": [
                {
                  language: "meta",
                  name: "terminal",
                  properties: {
                    "symbol": "s"
                  }
                }
              ]
            }
          }
        ]
      }
    });

    const terminalDesc: NodeTerminalSymbolDescription = {
      type: "terminal",
      symbol: "s",
    };

    expect(g).toEqual({
      root: undefined,
      types: {
        "l": { "t": { type: "concrete", attributes: [terminalDesc] } }
      }
    });
  });
});