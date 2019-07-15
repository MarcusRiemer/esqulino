import { GRAMMAR_BOOLEAN_DESCRIPTION } from './grammar.spec.boolean';
import { NodeDescription } from './syntaxtree.description';
import { _exactMatches, _singleChildReplace } from './drop';
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
          {
            operation: "insert",
            algorithm: "allowExact",
            location: [["expr", 0]],
            nodeDescription: candidates[0]
          },
          {
            operation: "insert",
            algorithm: "allowExact",
            location: [["expr", 0]],
            nodeDescription: candidates[1]
          }
        ]);
    });

    it('Not(<true>)', () => {
      const parentDesc: NodeDescription = {
        language: "expr",
        name: "negate",
        children: {
          "expr": [
            { language: "expr", name: "booleanConstant", properties: { "value": "true" } }
          ]
        }
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
          {
            operation: "insert",
            algorithm: "allowExact",
            location: [["lhs", 0]],
            nodeDescription: candidates[0]
          },
          {
            operation: "insert",
            algorithm: "allowExact",
            location: [["lhs", 0]],
            nodeDescription: candidates[1]
          }
        ]);
      expect(_exactMatches(v, treeIn, [["rhs", 0]], candidates))
        .toEqual([]);
    });


    it('Empty tree filled with constants', () => {
      const candidates: NodeDescription[] = [
        { language: "expr", name: "booleanConstant", properties: { "value": "false" } },
        { language: "expr", name: "booleanConstant", properties: { "value": "true" } },
        { language: "expr", name: "noMatch" }
      ];

      const v = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);
      const treeIn = new Tree();

      expect(_exactMatches(v, treeIn, [], candidates))
        .withContext("Two constants and a noMatch at root")
        .toEqual([
          {
            operation: "replace",
            algorithm: "allowExact",
            location: [],
            nodeDescription: candidates[0]
          },
          {
            operation: "replace",
            algorithm: "allowExact",
            location: [],
            nodeDescription: candidates[1]
          },
        ]);

      expect(_exactMatches(v, treeIn, [["a", 12]], candidates))
        .withContext("Two constants and a noMatch at invalid position")
        .toEqual([]);
    });
  });

  // ######################################################################

  describe('_singleChildReplace()', () => {

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

      expect(_singleChildReplace(v, treeIn, [], candidates)).toEqual([]);
      expect(_singleChildReplace(v, treeIn, [["expr", 0]], candidates)).toEqual([]);
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

      expect(_singleChildReplace(v, treeIn, [], candidates)).toEqual([]);
      expect(_singleChildReplace(v, treeIn, [["expr", 0]], candidates)).toEqual([]);
    });

    it('Not(<true>)', () => {
      const parentDesc: NodeDescription = {
        language: "expr",
        name: "negate",
        children: {
          "expr": [
            { language: "expr", name: "booleanConstant", properties: { "value": "true" } }
          ]
        }
      };
      const candidates: NodeDescription[] = [
        { language: "expr", name: "booleanConstant", properties: { "value": "false" } },
        { language: "expr", name: "booleanConstant", properties: { "value": "true" } }
      ];

      const v = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);
      const treeIn = new Tree(parentDesc);

      expect(_singleChildReplace(v, treeIn, [], candidates)).toEqual([]);
      expect(_singleChildReplace(v, treeIn, [["expr", 0]], candidates))
        .toEqual([
          {
            operation: "replace",
            algorithm: "allowReplace",
            location: [["expr", 0]],
            nodeDescription: candidates[0]
          },
          {
            operation: "replace",
            algorithm: "allowReplace",
            location: [["expr", 0]],
            nodeDescription: candidates[1]
          }
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

      expect(_singleChildReplace(v, treeIn, [], candidates)).toEqual([]);
      expect(_singleChildReplace(v, treeIn, [["lhs", 0]], candidates))
        .toEqual([]);
      expect(_singleChildReplace(v, treeIn, [["rhs", 0]], candidates))
        .toEqual([
          {
            operation: "replace",
            algorithm: "allowReplace",
            location: [["rhs", 0]],
            nodeDescription: candidates[0]
          },
          {
            operation: "replace",
            algorithm: "allowReplace",
            location: [["rhs", 0]],
            nodeDescription: candidates[1]
          }
        ]);
    });

    it('Binary(<hole>, not(<false>))', () => {
      const parentDesc: NodeDescription = {
        language: "expr",
        name: "booleanBinary",
        children: {
          "lhs": [],
          "rhs": [
            {
              language: "expr",
              name: "negate",
              children: {
                "expr": [
                  { language: "expr", name: "booleanConstant", properties: { "value": "false" } }
                ]
              }
            }
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

      expect(_singleChildReplace(v, treeIn, [], candidates)).toEqual([]);
      expect(_singleChildReplace(v, treeIn, [["lhs", 0]], candidates))
        .toEqual([]);
      expect(_singleChildReplace(v, treeIn, [["lhs", 0], ["expr", 0]], candidates))
        .toEqual([]);

      expect(_singleChildReplace(v, treeIn, [["rhs", 0]], candidates))
        .toEqual([
          {
            operation: "replace",
            algorithm: "allowReplace",
            location: [["rhs", 0]],
            nodeDescription: candidates[0]
          },
          {
            operation: "replace",
            algorithm: "allowReplace",
            location: [["rhs", 0]],
            nodeDescription: candidates[1]
          }
        ]);
      expect(_singleChildReplace(v, treeIn, [["rhs", 0], ["expr", 0]], candidates))
        .toEqual([
          {
            operation: "replace",
            algorithm: "allowReplace",
            location: [["rhs", 0], ["expr", 0]],
            nodeDescription: candidates[0]
          },
          {
            operation: "replace",
            algorithm: "allowReplace",
            location: [["rhs", 0], ["expr", 0]],
            nodeDescription: candidates[1]
          }
        ]);
    });

  });
});