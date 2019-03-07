import * as Schema from './grammar.description'
import * as AST from './syntaxtree'
import { Validator } from './validator'
import { ErrorCodes } from './validation-result'

describe('Grammar :: Parentheses', () => {
  describe(`g1 ::= ()`, () => {
    const g: Schema.GrammarDocument = {
      root: "root",
      technicalName: "spec",
      types: {
        "root": {
          type: "concrete",
          attributes: [
            {
              type: "parentheses",
              name: "g1",
              cardinality: "1",
              group: {
                type: "sequence",
                nodeTypes: []
              }
            }
          ]
        },
        "t1": {
          type: "concrete"
        }
      }
    }

    const v = new Validator([g]);

    it(`Children: []`, () => {
      const t: AST.NodeDescription = {
        language: "spec",
        name: "root",
        children: {
          "g1": []
        }
      };

      const res = v.validateFromRoot(new AST.Tree(t));

      expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.ParenthesesEmptyTypes]);
    });

    it(`Children: [t1]`, () => {
      const t: AST.NodeDescription = {
        language: "spec",
        name: "root",
        children: {
          "g1": [
            { language: "spec", name: "t1" }
          ]
        }
      };

      const res = v.validateFromRoot(new AST.Tree(t));

      expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.ParenthesesEmptyTypes]);
    });
  });

  describe(`g ::= (t1)`, () => {
    const g: Schema.GrammarDocument = {
      root: "root",
      technicalName: "spec",
      types: {
        "root": {
          type: "concrete",
          attributes: [
            {
              type: "parentheses",
              name: "g1",
              cardinality: "1",
              group: {
                type: "sequence",
                nodeTypes: ["t1"]
              }
            }
          ]
        },
        "t1": {
          type: "concrete"
        },
        "invalid": {
          type: "concrete"
        }
      }
    }

    it(`Children: []`, () => {
      const t: AST.NodeDescription = {
        language: "spec",
        name: "root",
        children: {
          "g1": []
        }
      };

      const v = new Validator([g]);
      const res = v.validateFromRoot(new AST.Tree(t));

      expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.InvalidMinOccurences]);
    });

    it(`Children: [t1]`, () => {
      const t: AST.NodeDescription = {
        language: "spec",
        name: "root",
        children: {
          "g1": [
            { language: "spec", name: "t1" }
          ]
        }
      };

      const v = new Validator([g]);
      const res = v.validateFromRoot(new AST.Tree(t));

      expect(res.errors.map(e => e.code)).toEqual([]);
    });

    it(`Children: [invalid]`, () => {
      const t: AST.NodeDescription = {
        language: "spec",
        name: "root",
        children: {
          "g1": [
            { language: "spec", name: "invalid" }
          ]
        }
      };

      const v = new Validator([g]);
      const res = v.validateFromRoot(new AST.Tree(t));

      expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.IllegalChildType]);
    });

    it(`Children: [t1, t1]`, () => {
      const t: AST.NodeDescription = {
        language: "spec",
        name: "root",
        children: {
          "g1": [
            { language: "spec", name: "t1" },
            { language: "spec", name: "t1" }
          ]
        }
      };

      const v = new Validator([g]);
      const res = v.validateFromRoot(new AST.Tree(t));

      expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.InvalidMaxOccurences]);
    });
  });

  describe(`g ::= (t1 t2)`, () => {
    const g: Schema.GrammarDocument = {
      root: "root",
      technicalName: "spec",
      types: {
        "root": {
          type: "concrete",
          attributes: [
            {
              type: "parentheses",
              name: "g1",
              cardinality: "1",
              group: {
                type: "sequence",
                nodeTypes: ["t1", "t2"]
              }
            }
          ]
        },
        "t1": {
          type: "concrete"
        },
        "t2": {
          type: "concrete"
        },
        "invalid": {
          type: "concrete"
        }
      }
    }

    it(`Children: []`, () => {
      const t: AST.NodeDescription = {
        language: "spec",
        name: "root",
        children: {
          "g1": []
        }
      };

      const v = new Validator([g]);
      const res = v.validateFromRoot(new AST.Tree(t));

      expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.InvalidMinOccurences]);
    });

    it(`Children: [t1]`, () => {
      const t: AST.NodeDescription = {
        language: "spec",
        name: "root",
        children: {
          "g1": [
            { language: "spec", name: "t1" }
          ]
        }
      };

      const v = new Validator([g]);
      const res = v.validateFromRoot(new AST.Tree(t));

      expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.MissingChild]);
    });

    it(`Children: [invalid]`, () => {
      const t: AST.NodeDescription = {
        language: "spec",
        name: "root",
        children: {
          "g1": [
            { language: "spec", name: "invalid" }
          ]
        }
      };

      const v = new Validator([g]);
      const res = v.validateFromRoot(new AST.Tree(t));

      expect(res.errors.map(e => e.code)).toEqual([
        ErrorCodes.IllegalChildType, ErrorCodes.MissingChild
      ]);
    });

    it(`Children: [t1, t1]`, () => {
      const t: AST.NodeDescription = {
        language: "spec",
        name: "root",
        children: {
          "g1": [
            { language: "spec", name: "t1" },
            { language: "spec", name: "t1" }
          ]
        }
      };

      const v = new Validator([g]);
      const res = v.validateFromRoot(new AST.Tree(t));

      expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.IllegalChildType]);
    });

    it(`Children: [t1, t2]`, () => {
      const t: AST.NodeDescription = {
        language: "spec",
        name: "root",
        children: {
          "g1": [
            { language: "spec", name: "t1" },
            { language: "spec", name: "t2" }
          ]
        }
      };

      const v = new Validator([g]);
      const res = v.validateFromRoot(new AST.Tree(t));

      expect(res.errors.map(e => e.code)).toEqual([]);
    });
  });
});