import { doc } from "prettier";
import { prettierCodeGeneratorFromGrammar } from "./codegenerator-prettier";
import { NamedLanguages, VisualisedLanguages } from "./grammar.description";
import { SyntaxTree } from "./syntaxtree";

describe(`Prettier code generator`, () => {
  describe(`Sanity Checks`, () => {
    const pp = (tree: doc.builders.Doc): string => {
      return doc.printer.printDocToString(tree, {
        embeddedInHtml: false,
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
      }).formatted;
    };

    it(`Indent with terminal before`, () => {
      const tree = doc.builders.concat([
        "root:",
        doc.builders.indent(
          doc.builders.concat([
            doc.builders.hardline,
            doc.builders.join(doc.builders.hardline, ["a", "b"]),
          ])
        ),
      ]);

      expect(pp(tree)).toEqual("root:\n  a\n  b");
    });

    it(`Indent without terminal before`, () => {
      const tree = doc.builders.concat([
        doc.builders.indent(
          doc.builders.concat([
            doc.builders.hardline,
            doc.builders.join(doc.builders.hardline, ["a", "b"]),
          ])
        ),
      ]);

      expect(pp(tree)).toEqual("\n  a\n  b");
    });
  });

  it(`Single terminal`, () => {
    const types: NamedLanguages = {
      l: {
        r: {
          type: "concrete",
          attributes: [
            {
              type: "terminal",
              symbol: "root",
            },
          ],
        },
      },
    };

    const t = new SyntaxTree({
      language: "l",
      name: "r",
    });

    const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
    expect(res).toEqual("root");
  });

  it(`two terminals`, () => {
    const types: NamedLanguages = {
      l: {
        r: {
          type: "concrete",
          attributes: [
            {
              type: "terminal",
              symbol: "1",
            },
            {
              type: "terminal",
              symbol: "2",
            },
          ],
        },
      },
    };

    const t = new SyntaxTree({
      language: "l",
      name: "r",
    });

    const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
    expect(res).toEqual("12");
  });

  describe(`single property`, () => {
    const types: NamedLanguages = {
      l: {
        r: {
          type: "concrete",
          attributes: [
            {
              type: "property",
              name: "p1",
              base: "string",
            },
          ],
        },
      },
    };

    it(`with present property at runtime`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
        properties: {
          p1: "v1",
        },
      });

      const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
      expect(res).toEqual("v1");
    });

    it(`with missing property at runtime`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
      });

      expect(() =>
        prettierCodeGeneratorFromGrammar(types, t.rootNode)
      ).toThrowError();
    });
  });

  describe(`single interpolation`, () => {
    const types: VisualisedLanguages = {
      l: {
        r: {
          type: "visualise",
          attributes: [
            {
              type: "interpolate",
              name: "p1",
            },
          ],
        },
      },
    };

    it(`with present property at runtime`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
        properties: {
          p1: "v1",
        },
      });

      const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
      expect(res).toEqual("v1");
    });

    it(`with missing property at runtime`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
      });

      expect(() =>
        prettierCodeGeneratorFromGrammar(types, t.rootNode)
      ).toThrowError();
    });
  });

  describe(`interpolation and terminal with spaces`, () => {
    const types: VisualisedLanguages = {
      l: {
        r: {
          type: "visualise",
          attributes: [
            {
              type: "interpolate",
              name: "p1",
            },
            {
              type: "interpolate",
              name: "p2",
              tags: ["space-before"],
            },
            {
              type: "interpolate",
              name: "p3",
              tags: ["space-after"],
            },
            {
              type: "interpolate",
              name: "p4",
            },
          ],
        },
      },
    };

    it(`with present property at runtime`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
        properties: {
          p1: "v1",
          p2: "v2",
          p3: "v3",
          p4: "v4",
        },
      });

      const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
      expect(res).toEqual("v1 v2v3 v4");
    });
  });

  describe(`interpolation and terminal with spacing around and quotation`, () => {
    const types: VisualisedLanguages = {
      l: {
        r: {
          type: "visualise",
          attributes: [
            {
              type: "interpolate",
              name: "p1",
            },
            {
              type: "interpolate",
              name: "p2",
              tags: ["space-around", "double-quote"],
            },
            {
              type: "interpolate",
              name: "p3",
            },
          ],
        },
      },
    };

    it(`with present property at runtime`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
        properties: {
          p1: "v1",
          p2: "v2",
          p3: "v3",
        },
      });

      const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
      expect(res).toEqual(`v1 "v2" v3`);
    });
  });

  describe(`sequence`, () => {
    const types: NamedLanguages = {
      l: {
        r: {
          type: "concrete",
          attributes: [
            {
              type: "sequence",
              name: "a1",
              nodeTypes: ["t1"],
            },
          ],
        },
        t1: {
          type: "concrete",
          attributes: [
            {
              type: "terminal",
              symbol: "t1",
            },
          ],
        },
      },
    };

    it(`empty`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
      });

      const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
      expect(res).toEqual("");
    });

    it(`single child`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
        children: {
          a1: [{ language: "l", name: "t1" }],
        },
      });

      const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
      expect(res).toEqual("t1");
    });

    it(`two children`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
        children: {
          a1: [
            { language: "l", name: "t1" },
            { language: "l", name: "t1" },
          ],
        },
      });

      const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
      expect(res).toEqual("t1t1");
    });
  });

  describe(`sequence with between`, () => {
    const types: NamedLanguages = {
      l: {
        r: {
          type: "concrete",
          attributes: [
            {
              type: "sequence",
              name: "a1",
              nodeTypes: [
                {
                  occurs: "*",
                  nodeType: "t1",
                },
              ],
              between: {
                type: "terminal",
                symbol: ",",
              },
            },
          ],
        },
        t1: {
          type: "concrete",
          attributes: [
            {
              type: "terminal",
              symbol: "t1",
            },
          ],
        },
      },
    };

    it(`empty`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
      });

      const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
      expect(res).toEqual("");
    });

    it(`single child`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
        children: {
          a1: [{ language: "l", name: "t1" }],
        },
      });

      const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
      expect(res).toEqual("t1");
    });

    it(`two children`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
        children: {
          a1: [
            { language: "l", name: "t1" },
            { language: "l", name: "t1" },
          ],
        },
      });

      const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
      expect(res).toEqual("t1,t1");
    });
  });

  describe(`vertical container with sequence with between`, () => {
    const types: NamedLanguages = {
      l: {
        r: {
          type: "concrete",
          attributes: [
            {
              type: "container",
              orientation: "vertical",
              children: [
                {
                  type: "sequence",
                  name: "a1",
                  nodeTypes: [
                    {
                      occurs: "*",
                      nodeType: "t1",
                    },
                  ],
                  between: {
                    type: "terminal",
                    symbol: ",",
                  },
                },
              ],
            },
          ],
        },
        t1: {
          type: "concrete",
          attributes: [
            {
              type: "terminal",
              symbol: "t1",
            },
          ],
        },
      },
    };

    it(`empty`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
      });

      const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
      expect(res).toEqual("");
    });

    it(`single child`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
        children: {
          a1: [{ language: "l", name: "t1" }],
        },
      });

      const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
      expect(res).toEqual("t1");
    });

    it(`two children`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
        children: {
          a1: [
            { language: "l", name: "t1" },
            { language: "l", name: "t1" },
          ],
        },
      });

      const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
      expect(res).toEqual("t1,\nt1");
    });
  });

  describe(`vertical container with leading terminal sequence with between`, () => {
    const types: NamedLanguages = {
      l: {
        r: {
          type: "concrete",
          attributes: [
            {
              type: "terminal",
              symbol: "c:",
            },
            {
              type: "container",
              orientation: "vertical",
              tags: ["indent"],
              children: [
                {
                  type: "sequence",
                  name: "a1",
                  nodeTypes: [
                    {
                      occurs: "*",
                      nodeType: "t1",
                    },
                  ],
                  between: {
                    type: "terminal",
                    symbol: ",",
                  },
                },
              ],
            },
          ],
        },
        t1: {
          type: "concrete",
          attributes: [
            {
              type: "terminal",
              symbol: "t1",
            },
          ],
        },
      },
    };

    it(`empty`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
      });

      const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
      expect(res).toEqual("c:");
    });

    it(`single child`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
        children: {
          a1: [{ language: "l", name: "t1" }],
        },
      });

      const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
      expect(res).toEqual("c:\n  t1");
    });

    it(`two children`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
        children: {
          a1: [
            { language: "l", name: "t1" },
            { language: "l", name: "t1" },
          ],
        },
      });

      const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
      expect(res).toEqual("c:\n  t1,\n  t1");
    });
  });

  describe(`vertical container with leading and following terminal sequence with between`, () => {
    const types: NamedLanguages = {
      l: {
        r: {
          type: "concrete",
          attributes: [
            {
              type: "terminal",
              symbol: "=>",
            },
            {
              type: "container",
              orientation: "vertical",
              tags: ["indent"],
              children: [
                {
                  type: "sequence",
                  name: "a1",
                  nodeTypes: [
                    {
                      occurs: "*",
                      nodeType: "t1",
                    },
                  ],
                  between: {
                    type: "terminal",
                    symbol: ",",
                  },
                },
              ],
            },
            {
              type: "terminal",
              symbol: "<=",
            },
          ],
        },
        t1: {
          type: "concrete",
          attributes: [
            {
              type: "terminal",
              symbol: "t1",
            },
          ],
        },
      },
    };

    it(`empty`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
      });

      const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
      expect(res).toEqual("=><=");
    });

    it(`single child`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
        children: {
          a1: [{ language: "l", name: "t1" }],
        },
      });

      const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
      expect(res).toEqual("=>\n  t1\n<=");
    });

    it(`two children`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
        children: {
          a1: [
            { language: "l", name: "t1" },
            { language: "l", name: "t1" },
          ],
        },
      });

      const res = prettierCodeGeneratorFromGrammar(types, t.rootNode);
      expect(res).toEqual("=>\n  t1,\n  t1\n<=");
    });
  });
});
