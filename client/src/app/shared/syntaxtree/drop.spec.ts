import { GRAMMAR_BOOLEAN_DESCRIPTION } from './grammar-boolean.spec';
import { NodeDescription } from './syntaxtree.description';
import { _exactMatches } from './drop';
import { Tree } from './syntaxtree';
import { Validator } from './validator';

describe('Drop', () => {
  describe('_exactMatches()', () => {
    it('<false>', () => {
      const parentDesc: NodeDescription = {
        language: "expr", name: "booleanConstant", properties: { "value": "false" }
      };
      const candidates: NodeDescription[] = [
        { language: "expr", name: "booleanConstant", properties: { "value": "false" } },
        { language: "expr", name: "booleanConstant", properties: { "value": "true" } }
      ];

      const v = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);
      const treeIn = new Tree(parentDesc);

      expect(_exactMatches(v, treeIn, [], candidates)).toEqual([]);
      expect(_exactMatches(v, treeIn, [["expr", 0]], candidates)).toEqual([]);
    });

    it('Not(<hole>)', () => {
      const parentDesc: NodeDescription = {
        language: "expr",
        name: "negate",
        children: {
          "expr": []
        }
      };
      const candidates: NodeDescription[] = [
        { language: "expr", name: "booleanConstant", properties: { "value": "false" } },
        { language: "expr", name: "booleanConstant", properties: { "value": "true" } }
      ];

      const v = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);
      const treeIn = new Tree(parentDesc);

      expect(_exactMatches(v, treeIn, [], candidates)).toEqual([]);
      expect(_exactMatches(v, treeIn, [["expr", 0]], candidates))
        .toEqual([
          { operation: "insert", location: [["expr", 0]], nodeDescription: candidates[0] },
          { operation: "insert", location: [["expr", 0]], nodeDescription: candidates[1] }
        ]);
    });

    it('Binary(<hole>, <false>)', () => {
      const parentDesc: NodeDescription = {
        language: "expr",
        name: "booleanBinary",
        children: {
          "lhs": [],
          "rhs": [
            { language: "expr", name: "booleanConstant", properties: { "value": "false" } }
          ]
        }
      };
      const candidates: NodeDescription[] = [
        { language: "expr", name: "booleanConstant", properties: { "value": "false" } },
        { language: "expr", name: "booleanConstant", properties: { "value": "true" } },
        { language: "expr", name: "noMatch" }
      ];

      const v = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);
      const treeIn = new Tree(parentDesc);

      expect(_exactMatches(v, treeIn, [], candidates)).toEqual([]);
      expect(_exactMatches(v, treeIn, [["lhs", 0]], candidates))
        .toEqual([
          { operation: "insert", location: [["lhs", 0]], nodeDescription: candidates[0] },
          { operation: "insert", location: [["lhs", 0]], nodeDescription: candidates[1] }
        ]);
      expect(_exactMatches(v, treeIn, [["rhs", 0]], candidates))
        .toEqual([]);
    });
  });

  // ######################################################################
});