import { SyntaxTree } from "./syntaxtree";
import { CodeGenerator } from "./codegenerator";
import { NamedLanguages, VisualisedLanguages } from "./grammar.description";

describe(`Automatic code generation`, () => {
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

    const g = new CodeGenerator([], types, "legacy");

    expect(g.hasImplicitConverter({ languageName: "l", typeName: "r" })).toBe(
      true
    );

    const t = new SyntaxTree({
      language: "l",
      name: "r",
    });

    const res = g.emit(t);
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

    const g = new CodeGenerator([], types, "legacy");

    expect(g.hasImplicitConverter({ languageName: "l", typeName: "r" })).toBe(
      true
    );

    const t = new SyntaxTree({
      language: "l",
      name: "r",
    });

    const res = g.emit(t);
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

    const g = new CodeGenerator([], types, "legacy");

    it(`isDefined`, () => {
      expect(g.hasImplicitConverter({ languageName: "l", typeName: "r" })).toBe(
        true
      );
    });

    it(`with present property at runtime`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
        properties: {
          p1: "v1",
        },
      });

      const res = g.emit(t);
      expect(res).toEqual("v1");
    });

    it(`with missing property at runtime`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
      });

      expect(() => g.emit(t)).toThrowError();
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

    const g = new CodeGenerator([], types, "legacy");

    it(`isDefined`, () => {
      expect(g.hasImplicitConverter({ languageName: "l", typeName: "r" })).toBe(
        true
      );
    });

    it(`with present property at runtime`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
        properties: {
          p1: "v1",
        },
      });

      const res = g.emit(t);
      expect(res).toEqual("v1");
    });

    it(`with missing property at runtime`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
      });

      expect(() => g.emit(t)).toThrowError();
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

    const g = new CodeGenerator([], types, "legacy");

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

      const res = g.emit(t);
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

    const g = new CodeGenerator([], types, "legacy");

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

      const res = g.emit(t);
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

    const g = new CodeGenerator([], types, "legacy");

    it(`empty`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
      });

      const res = g.emit(t);
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

      const res = g.emit(t);
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

      const res = g.emit(t);
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

    const g = new CodeGenerator([], types, "legacy");

    it(`empty`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
      });

      const res = g.emit(t);
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

      const res = g.emit(t);
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

      const res = g.emit(t);
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

    const g = new CodeGenerator([], types, "legacy");

    it(`empty`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
      });

      const res = g.emit(t);
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

      const res = g.emit(t);
      expect(res).toEqual("  t1");
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

      const res = g.emit(t);
      expect(res).toEqual("  t1,\n  t1");
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
              tags: ["newline-after"],
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

    const g = new CodeGenerator([], types, "legacy");

    it(`empty`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
      });

      const res = g.emit(t);
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

      const res = g.emit(t);
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

      const res = g.emit(t);
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
              tags: ["newline-after"],
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
              tags: ["newline-after"],
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

    const g = new CodeGenerator([], types, "legacy");

    it(`empty`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
      });

      const res = g.emit(t);
      expect(res).toEqual("=>\n<=");
    });

    it(`single child`, () => {
      const t = new SyntaxTree({
        language: "l",
        name: "r",
        children: {
          a1: [{ language: "l", name: "t1" }],
        },
      });

      const res = g.emit(t);
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

      const res = g.emit(t);
      expect(res).toEqual("=>\n  t1,\n  t1\n<=");
    });
  });
});
