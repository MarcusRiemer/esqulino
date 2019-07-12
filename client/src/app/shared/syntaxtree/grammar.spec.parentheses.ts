import * as Schema from './grammar.description'
import * as AST from './syntaxtree'
import { Validator } from './validator'
import { ErrorCodes } from './validation-result'
import { grammarWith } from './grammar.spec-util';

describe('Grammar :: Parentheses', () => {

  const mkParenTree = (typeNames: string[]): AST.NodeDescription => {
    return ({
      language: "spec",
      name: "root",
      children: {
        "g1": typeNames.map(t => { return ({ language: "spec", name: t }) })
      }
    });
  }

  describe(`Sequence`, () => {
    describe(`g1 ::= ()`, () => {
      const g: Schema.GrammarDocument = grammarWith("spec", "root", {
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
      });

      const v = new Validator([g]);

      it(`Children: []`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree([])));
        expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.ParenthesesEmptyTypes]);
      });

      it(`Children: [t1]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t1"])));
        expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.ParenthesesEmptyTypes]);
      });
    });

    describe(`g ::= (t1)`, () => {
      const g: Schema.GrammarDocument = grammarWith("spec", "root", {
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
      });

      const v = new Validator([g]);

      it(`Children: []`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree([])));
        expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.InvalidMinOccurences]);
      });

      it(`Children: [t1]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t1"])));
        expect(res.errors.map(e => e.code)).toEqual([]);
      });

      it(`Children: [invalid]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["invalid"])));
        expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.IllegalChildType]);
      });

      it(`Children: [t1, t1]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t1", "t1"])));
        expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.InvalidMaxOccurences]);
      });
    });

    describe(`g ::= (t1 t2)`, () => {
      const g: Schema.GrammarDocument = grammarWith("spec", "root", {
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
      });

      const v = new Validator([g]);

      it(`Children: []`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree([])));
        expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.InvalidMinOccurences]);
      });

      it(`Children: [invalid]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["invalid"])));

        expect(res.errors.map(e => e.code)).toEqual([
          ErrorCodes.IllegalChildType, ErrorCodes.MissingChild
        ]);
      });

      it(`Children: [t1]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t1"])));
        expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.MissingChild]);
      });

      it(`Children: [t2]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t2"])));
        expect(res.errors.map(e => e.code)).toEqual([
          ErrorCodes.IllegalChildType, ErrorCodes.MissingChild
        ]);
      });

      it(`Children: [t1, t1]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t1", "t1"])));
        expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.IllegalChildType]);
      });

      it(`Children: [t1, t2]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t1", "t2"])));
        expect(res.errors.map(e => e.code)).toEqual([]);
      });

      it(`Children: [t1, t2, t1]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t1", "t2", "t1"])));
        expect(res.errors.map(e => e.code)).toEqual(
          [ErrorCodes.MissingChild, ErrorCodes.InvalidMaxOccurences]
        );
      });

      it(`Children: [t1, t2, t1, t2]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t1", "t2", "t1", "t2"])));
        expect(res.errors.map(e => e.code)).toEqual(
          [ErrorCodes.InvalidMaxOccurences]
        );
      });
    });

    describe(`g ::= (t1 t2?)`, () => {
      const g: Schema.GrammarDocument = grammarWith("spec", "root", {
        "root": {
          type: "concrete",
          attributes: [
            {
              type: "parentheses",
              name: "g1",
              cardinality: "1",
              group: {
                type: "sequence",
                nodeTypes: [
                  "t1",
                  { nodeType: "t2", occurs: "?" }
                ]
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
      });

      const v = new Validator([g]);

      it(`Children: []`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree([])));
        expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.InvalidMinOccurences]);
      });

      it(`Children: [invalid]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["invalid"])));

        expect(res.errors.map(e => e.code)).toEqual([
          ErrorCodes.IllegalChildType
        ]);
      });

      it(`Children: [t1]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t1"])));
        expect(res.errors.map(e => e.code)).toEqual([]);
      });

      it(`Children: [t2]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t2"])));
        expect(res.errors.map(e => e.code)).toEqual([
          ErrorCodes.IllegalChildType
        ]);
      });

      it(`Children: [t1, t1]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t1", "t1"])));
        expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.InvalidMaxOccurences]);
      });

      it(`Children: [t1, t2, t1]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t1", "t2", "t1"])));
        expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.InvalidMaxOccurences]);
      });

      it(`Children: [t1, t2, t1, t1]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t1", "t2", "t1", "t1"])));
        expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.InvalidMaxOccurences]);
      });
    });
  });

  describe("Allowed", () => {
    describe(`g ::= (t1)`, () => {
      const g: Schema.GrammarDocument = grammarWith("spec", "root", {
        "root": {
          type: "concrete",
          attributes: [
            {
              type: "parentheses",
              name: "g1",
              cardinality: "1",
              group: {
                type: "allowed",
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
      });

      const v = new Validator([g]);

      it(`Children: []`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree([])));
        expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.InvalidMinOccurences]);
      });

      it(`Children: [t1]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t1"])));
        expect(res.errors.map(e => e.code)).toEqual([]);
      });

      it(`Children: [invalid]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["invalid"])));
        expect(res.errors.map(e => e.code)).toEqual([
          ErrorCodes.IllegalChildType, ErrorCodes.InvalidMinOccurences
        ]);
      });

      it(`Children: [invalid, t1]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["invalid", "t1"])));
        expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.IllegalChildType]);
      });

      it(`Children: [t1, invalid]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["invalid", "t1"])));
        expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.IllegalChildType]);
      });

      it(`Children: [t1, t1]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t1", "t1"])));
        expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.InvalidMaxOccurences]);
      });
    });

    describe(`g ::= (t1 & t2)`, () => {
      const g: Schema.GrammarDocument = grammarWith("spec", "root", {
        "root": {
          type: "concrete",
          attributes: [
            {
              type: "parentheses",
              name: "g1",
              cardinality: "1",
              group: {
                type: "allowed",
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
      });

      const v = new Validator([g]);

      it(`Children: []`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree([])));
        expect(res.errors.map(e => e.code)).toEqual([
          ErrorCodes.InvalidMinOccurences
        ]);
      });

      it(`Children: [t1]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t1"])));
        expect(res.errors.map(e => e.code)).toEqual([ErrorCodes.InvalidMinOccurences]);
      });

      it(`Children: [invalid]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["invalid"])));
        expect(res.errors.map(e => e.code)).toEqual([
          ErrorCodes.IllegalChildType, ErrorCodes.InvalidMinOccurences, ErrorCodes.InvalidMinOccurences
        ]);
      });

      it(`Children: [invalid, t1]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["invalid", "t1"])));
        expect(res.errors.map(e => e.code)).toEqual([
          ErrorCodes.IllegalChildType, ErrorCodes.InvalidMinOccurences
        ]);
      });

      it(`Children: [t1, invalid]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["invalid", "t1"])));
        expect(res.errors.map(e => e.code)).toEqual([
          ErrorCodes.IllegalChildType, ErrorCodes.InvalidMinOccurences
        ]);
      });

      it(`Children: [t1, t1]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t1", "t1"])));
        expect(res.errors.map(e => e.code)).toEqual([
          ErrorCodes.InvalidMaxOccurences, ErrorCodes.InvalidMinOccurences
        ]);
      });

      it(`Children: [t1, t2]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t1", "t2"])));
        expect(res.errors.map(e => e.code)).toEqual([]);
      });
    });

    describe(`g ::= (t1 & t2?)`, () => {
      const g: Schema.GrammarDocument = grammarWith("spec", "root", {
        "root": {
          type: "concrete",
          attributes: [
            {
              type: "parentheses",
              name: "g1",
              cardinality: "1",
              group: {
                type: "allowed",
                nodeTypes: [
                  "t1",
                  { nodeType: "t2", occurs: "?" }
                ]
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
      });

      const v = new Validator([g]);

      it(`Children: []`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree([])));
        expect(res.errors.map(e => e.code)).toEqual([
          ErrorCodes.InvalidMinOccurences
        ]);
      });

      it(`Children: [t1]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t1"])));
        expect(res.errors.map(e => e.code)).toEqual([]);
      });

      it(`Children: [invalid]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["invalid"])));
        expect(res.errors.map(e => e.code)).toEqual([
          ErrorCodes.IllegalChildType, ErrorCodes.InvalidMinOccurences
        ]);
      });

      it(`Children: [invalid, t1]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["invalid", "t1"])));
        expect(res.errors.map(e => e.code)).toEqual([
          ErrorCodes.IllegalChildType
        ]);
      });

      it(`Children: [t1, invalid]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["invalid", "t1"])));
        expect(res.errors.map(e => e.code)).toEqual([
          ErrorCodes.IllegalChildType
        ]);
      });

      it(`Children: [t1, t1]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t1", "t1"])));
        expect(res.errors.map(e => e.code)).toEqual([
          ErrorCodes.InvalidMaxOccurences
        ]);
      });

      it(`Children: [t1, t2]`, () => {
        const res = v.validateFromRoot(new AST.Tree(mkParenTree(["t1", "t2"])));
        expect(res.errors.map(e => e.code)).toEqual([]);
      });
    });
  });
});