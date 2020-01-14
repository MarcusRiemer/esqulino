import { GRAMMAR_ARITHMETIC_DESCRIPTION } from "./grammar.spec.arithmetic";
import { GRAMMAR_BOOLEAN_DESCRIPTION } from './grammar.spec.boolean';
import { GRAMMAR_SQL_DESCRIPTION } from './grammar.spec.sql';
import { singleLanguageGrammar } from './grammar.spec-util';

import { isVisualGrammar } from './grammar-visual';
import * as AST from './syntaxtree'
import { Validator } from './validator'


describe(`Visual Grammar`, () => {
  it(`isVisual() for spec languages`, () => {
    expect(isVisualGrammar(GRAMMAR_ARITHMETIC_DESCRIPTION)).toBe(false);
    expect(isVisualGrammar(GRAMMAR_BOOLEAN_DESCRIPTION)).toBe(false);
    expect(isVisualGrammar(GRAMMAR_SQL_DESCRIPTION)).toBe(true);
  });

  it(`isVisual() detects terminal symbols`, () => {
    const g = singleLanguageGrammar("spec", "root", {
      "root": {
        type: "concrete",
        attributes: [
          { type: "terminal", name: "foo", symbol: "foo" }
        ]
      }
    });
    expect(isVisualGrammar(g)).toBe(true);
  });

  it(`isVisual() detects terminal rows`, () => {
    const g = singleLanguageGrammar("spec", "root", {
      "root": {
        type: "concrete",
        attributes: [
          {
            type: "container",
            orientation: "horizontal",
            name: "argh",
            children: [
              { type: "allowed", name: "a1", nodeTypes: [] }
            ]
          }
        ]
      }
    });
    expect(isVisualGrammar(g)).toBe(true);
  });

  it(`Parses terminals (and ignores them)`, () => {
    const g = singleLanguageGrammar("terminal", "root", {
      "root": {
        type: "concrete",
        attributes: [
          { type: "terminal", name: "foo", symbol: "foo" }
        ]
      }
    });

    const v = new Validator([g]);

    const ast = new AST.Tree({
      language: "terminal",
      name: "root"
    });

    expect(v.validateFromRoot(ast).isValid).toBe(true);

    const vTerminal = v.getGrammarValidator("terminal");
    const vRoot = vTerminal.getType("terminal", "root");

    expect(vRoot.allowedChildrenCategoryNames).toEqual([]);
    expect(vRoot.allowedPropertyNames).toEqual([]);
  });

  it(`Parses rows and includes children`, () => {
    const g = singleLanguageGrammar("terminal", "root", {
      "root": {
        type: "concrete",
        attributes: [
          {
            type: "container",
            orientation: "horizontal",
            name: "argh",
            children: [
              { type: "allowed", name: "a1", nodeTypes: [] }
            ]
          },
          { type: "allowed", name: "a2", nodeTypes: [] }
        ]
      }
    });

    const v = new Validator([g]);

    const ast = new AST.Tree({
      language: "terminal",
      name: "root"
    });

    expect(v.validateFromRoot(ast).isValid).toBe(true);

    const vTerminal = v.getGrammarValidator("terminal");
    const vRoot = vTerminal.getType("terminal", "root");

    expect(vRoot.allowedChildrenCategoryNames).toEqual(["a1", "a2"]);
    expect(vRoot.allowedPropertyNames).toEqual([]);
  });

  it(`Parses rows and includes properties`, () => {
    const g = singleLanguageGrammar("terminal", "root", {
      "root": {
        type: "concrete",
        attributes: [
          {
            type: "container",
            orientation: "horizontal",
            name: "argh",
            children: [
              { type: "property", name: "p1", base: "integer" }
            ]
          },
          { type: "property", name: "p2", base: "integer" }
        ]
      }
    });

    const v = new Validator([g]);

    const ast = new AST.Tree({
      language: "terminal",
      name: "root"
    });

    expect(v.validateFromRoot(ast).isValid).toBe(false);

    const vTerminal = v.getGrammarValidator("terminal");
    const vRoot = vTerminal.getType("terminal", "root");

    expect(vRoot.allowedChildrenCategoryNames).toEqual([]);
    expect(vRoot.allowedPropertyNames).toEqual(["p1", "p2"]);
  });
});