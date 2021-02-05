import { GRAMMAR_ARITHMETIC_DESCRIPTION } from "./grammar.spec.arithmetic";
import { GRAMMAR_BOOLEAN_DESCRIPTION } from "./grammar.spec.boolean";
import { GRAMMAR_SQL_DESCRIPTION } from "./grammar.spec.sql";
import { mkSingleLanguageGrammar } from "./grammar.spec-util";

import { hasVisualType } from "./grammar-visual";
import * as AST from "./syntaxtree";
import { Validator } from "./validator";
import { allConcreteTypes } from "./grammar-type-util";

describe(`Visual Grammar`, () => {
  it(`isVisual() for spec languages`, () => {
    expect(
      hasVisualType(allConcreteTypes(GRAMMAR_ARITHMETIC_DESCRIPTION))
    ).toBeFalse();
    expect(
      hasVisualType(allConcreteTypes(GRAMMAR_BOOLEAN_DESCRIPTION))
    ).toBeFalse();
    expect(hasVisualType(allConcreteTypes(GRAMMAR_SQL_DESCRIPTION))).toBeTrue();
  });

  it(`isVisual() detects terminal symbols`, () => {
    expect(
      hasVisualType({
        spec: {
          root: {
            type: "concrete",
            attributes: [{ type: "terminal", name: "foo", symbol: "foo" }],
          },
        },
      })
    ).toBe(true);
  });

  it(`isVisual() detects terminal rows`, () => {
    expect(
      hasVisualType({
        spec: {
          root: {
            type: "concrete",
            attributes: [
              {
                type: "container",
                orientation: "horizontal",
                name: "argh",
                children: [{ type: "allowed", name: "a1", nodeTypes: [] }],
              },
            ],
          },
        },
      })
    ).toBe(true);
  });

  it(`Parses terminals (and ignores them)`, () => {
    const g = mkSingleLanguageGrammar("terminal", "root", {
      root: {
        type: "concrete",
        attributes: [{ type: "terminal", name: "foo", symbol: "foo" }],
      },
    });

    const v = new Validator([g]);

    const ast = new AST.Tree({
      language: "terminal",
      name: "root",
    });

    expect(v.validateFromRoot(ast).isValid).toBe(true);

    const vTerminal = v.getGrammarValidator("terminal");
    const vRoot = vTerminal.getType("terminal", "root");

    expect(vRoot.allowedChildrenCategoryNames).toEqual([]);
    expect(vRoot.allowedPropertyNames).toEqual([]);
  });

  it(`Parses rows and includes children`, () => {
    const g = mkSingleLanguageGrammar("terminal", "root", {
      root: {
        type: "concrete",
        attributes: [
          {
            type: "container",
            orientation: "horizontal",
            name: "argh",
            children: [{ type: "allowed", name: "a1", nodeTypes: [] }],
          },
          { type: "allowed", name: "a2", nodeTypes: [] },
        ],
      },
    });

    const v = new Validator([g]);

    const ast = new AST.Tree({
      language: "terminal",
      name: "root",
    });

    expect(v.validateFromRoot(ast).isValid).toBe(true);

    const vTerminal = v.getGrammarValidator("terminal");
    const vRoot = vTerminal.getType("terminal", "root");

    expect(vRoot.allowedChildrenCategoryNames).toEqual(["a1", "a2"]);
    expect(vRoot.allowedPropertyNames).toEqual([]);
  });

  it(`Parses rows and includes properties`, () => {
    const g = mkSingleLanguageGrammar("terminal", "root", {
      root: {
        type: "concrete",
        attributes: [
          {
            type: "container",
            orientation: "horizontal",
            name: "argh",
            children: [{ type: "property", name: "p1", base: "integer" }],
          },
          { type: "property", name: "p2", base: "integer" },
        ],
      },
    });

    const v = new Validator([g]);

    const ast = new AST.Tree({
      language: "terminal",
      name: "root",
    });

    expect(v.validateFromRoot(ast).isValid).toBe(false);

    const vTerminal = v.getGrammarValidator("terminal");
    const vRoot = vTerminal.getType("terminal", "root");

    expect(vRoot.allowedChildrenCategoryNames).toEqual([]);
    expect(vRoot.allowedPropertyNames).toEqual(["p1", "p2"]);
  });
});
