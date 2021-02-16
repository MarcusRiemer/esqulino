import { Tree } from "./syntaxtree";
import { CodeGenerator } from "./codegenerator";
import { NamedLanguages } from "./grammar.description";

fdescribe(`Automatic code generation`, () => {
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

    const g = new CodeGenerator([], types);

    expect(g.hasImplicitConverter({ languageName: "l", typeName: "r" })).toBe(
      true
    );

    const t = new Tree({
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

    const g = new CodeGenerator([], types);

    expect(g.hasImplicitConverter({ languageName: "l", typeName: "r" })).toBe(
      true
    );

    const t = new Tree({
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

    const g = new CodeGenerator([], types);

    it(`isDefined`, () => {
      expect(g.hasImplicitConverter({ languageName: "l", typeName: "r" })).toBe(
        true
      );
    });

    it(`with present property at runtime`, () => {
      const t = new Tree({
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
      const t = new Tree({
        language: "l",
        name: "r",
      });

      expect(() => g.emit(t)).toThrowError();
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

    const g = new CodeGenerator([], types);

    it(`empty`, () => {
      const t = new Tree({
        language: "l",
        name: "r",
      });

      const res = g.emit(t);
      expect(res).toEqual("");
    });

    it(`single child`, () => {
      const t = new Tree({
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
      const t = new Tree({
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

    const g = new CodeGenerator([], types);

    it(`empty`, () => {
      const t = new Tree({
        language: "l",
        name: "r",
      });

      const res = g.emit(t);
      expect(res).toEqual("");
    });

    it(`single child`, () => {
      const t = new Tree({
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
      const t = new Tree({
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
});
