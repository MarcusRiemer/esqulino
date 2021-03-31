import { mkGrammarDescription } from "../../editor/spec-util";
import { BlattWerkzeugError } from "../blattwerkzeug-error";
import { NodeTerminalSymbolDescription } from "./grammar.description";
import { Language } from "./language";
import { SyntaxTree } from "./syntaxtree";

const EMPTY_LANGUAGE = new Language({
  id: "empty",
  name: "Empty",
  emitters: [],
  validators: [],
  codeGeneratorState: [],
});

const TERMINAL_R: NodeTerminalSymbolDescription = {
  type: "terminal",
  symbol: "r",
};

const SINGLE_ROOT_GRAMMAR = mkGrammarDescription({
  types: {
    l: {
      r: {
        type: "concrete",
        attributes: [TERMINAL_R],
      },
    },
  },
});

const VIS_SINGLE_ROOT_GRAMMAR = mkGrammarDescription({
  visualisations: {
    l: {
      r: {
        type: "visualise",
        attributes: [TERMINAL_R],
      },
    },
  },
});

const SINGLE_ROOT_TREE = new SyntaxTree({
  language: "l",
  name: "r",
});

describe(`Language`, () => {
  describe(`without grammar`, () => {
    it(`Error emitting`, () => {
      expect(() => EMPTY_LANGUAGE.emitTree(SINGLE_ROOT_TREE)).toThrowMatching(
        (e) => e instanceof BlattWerkzeugError
      );
    });

    it(`Error finding a type`, () => {
      expect(() =>
        EMPTY_LANGUAGE.getType({ languageName: "l", typeName: "r" })
      ).toThrowMatching((e) => e instanceof BlattWerkzeugError);
    });
  });

  describe(`cloneWithGrammar`, () => {
    it(`Emits according to concrete grammar`, () => {
      const gl = EMPTY_LANGUAGE.cloneWithGrammar(SINGLE_ROOT_GRAMMAR);
      const emitted = gl.emitTree(SINGLE_ROOT_TREE);

      expect(emitted).toEqual("r");
    });

    it(`Emits according to visualized grammar`, () => {
      const gl = EMPTY_LANGUAGE.cloneWithGrammar(VIS_SINGLE_ROOT_GRAMMAR);
      const emitted = gl.emitTree(SINGLE_ROOT_TREE);

      expect(emitted).toEqual("r");
    });

    it(`Finds type of concrete grammar`, () => {
      const gl = EMPTY_LANGUAGE.cloneWithGrammar(SINGLE_ROOT_GRAMMAR);
      const resType = gl.getType({ languageName: "l", typeName: "r" });

      expect(resType).toBeDefined();
    });

    it(`Misses type of visualized grammar`, () => {
      const gl = EMPTY_LANGUAGE.cloneWithGrammar(VIS_SINGLE_ROOT_GRAMMAR);
      expect(() =>
        gl.getType({ languageName: "l", typeName: "r" })
      ).toThrowMatching((e) => e instanceof BlattWerkzeugError);
    });
  });
});
