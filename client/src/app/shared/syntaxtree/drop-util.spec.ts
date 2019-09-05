import { NodeDescription, NodeLocation } from './syntaxtree.description';
import { Tree } from './syntaxtree';
import { Validator } from './validator';
import { _cardinalityAllowsInsertion, nodeIsInSingularHole, relativeDropLocation } from './drop-util';
import { ErrorCodes } from './validation-result';

import { GRAMMAR_BOOLEAN_DESCRIPTION } from './grammar.spec.boolean';
import { GRAMMAR_SQL_DESCRIPTION } from './grammar.spec.sql';

describe('Drop Utils', () => {
  describe('_cardinalityAllowsInsertion', () => {
    it('Full binary expression', () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanBinary",
        children: {
          "lhs": [
            {
              language: "expr",
              name: "booleanConstant",
              properties: {
                "value": "true"
              }
            }
          ],
          "rhs": [
            {
              language: "expr",
              name: "booleanConstant",
              properties: {
                "value": "true"
              }
            }
          ]
        },
        properties: {
          "operator": "+"
        }
      };

      const candidateDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          "value": "false"
        }
      }

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);
      const inNode = new Tree(inTreeDesc).rootNode;

      expect(validator.validateFromRoot(inNode).errors).toEqual([]);

      // Inserting to a filled right hand side
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "lhs", 0)).toBe(false);
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "lhs", 1)).toBe(false);
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "lhs", 2)).toBe(false);

      // Inserting to a filled left hand side
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "rhs", 0)).toBe(false);
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "rhs", 1)).toBe(false);
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "rhs", 2)).toBe(false);
    });


    it('Partial binary expression', () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanBinary",
        children: {
          "lhs": [
            {
              language: "expr",
              name: "booleanConstant",
              properties: {
                "value": "true"
              }
            }
          ],
          "rhs": []
        },
        properties: {
          "operator": "+"
        }
      };

      const candidateDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          "value": "false"
        }
      }

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);
      const inNode = new Tree(inTreeDesc).rootNode;

      expect(validator.validateFromRoot(inNode).errors.map(e => e.code))
        .toEqual([ErrorCodes.InvalidMinOccurences]);

      // Inserting to a filled right hand side
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "lhs", 0)).toBe(false);
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "lhs", 1)).toBe(false);
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "lhs", 2)).toBe(false);

      // Inserting to an empty left hand side
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "rhs", 0)).toBe(true);
    });

    it('Empty binary expression', () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanBinary",
        children: {
          "lhs": [],
          "rhs": []
        },
        properties: {
          "operator": "+"
        }
      };

      const candidateDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          "value": "false"
        }
      }

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);
      const inNode = new Tree(inTreeDesc).rootNode;

      // Insertion is valid at both sides
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "lhs", 0)).toBe(true);
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "rhs", 0)).toBe(true);
    });

    it('Deals with unexpected existing trees', () => {
      const inTreeDesc: NodeDescription = {
        language: "unexpected",
        name: "booleanBinary",
        children: {
          "lhs": [],
          "rhs": []
        },
        properties: {
          "operator": "+"
        }
      };

      const candidateDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          "value": "false"
        }
      }

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);
      const inNode = new Tree(inTreeDesc).rootNode;

      // Insertion is invalid whereever we look
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "lhs", 0)).toBe(false);
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "rhs", 0)).toBe(false);
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "foo", 0)).toBe(false);
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "bar", 0)).toBe(false);
    });

    it('Deals with unexpected candidates', () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanBinary",
        children: {
          "lhs": [],
          "rhs": []
        },
        properties: {
          "operator": "+"
        }
      };

      const candidateDesc: NodeDescription = {
        language: "unexpected",
        name: "booleanConstant",
        properties: {
          "value": "false"
        }
      }

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);
      const inNode = new Tree(inTreeDesc).rootNode;

      // Insertion is invalid whereever we look
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "lhs", 0)).toBe(false);
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "rhs", 0)).toBe(false);
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "foo", 0)).toBe(false);
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "bar", 0)).toBe(false);
    });

    it(`SQL: Insert second SELECT to "SELECT *"`, () => {
      const inTreeDesc: NodeDescription = {
        language: "sql",
        name: "querySelect",
        children: {
          "select": [{
            language: "sql",
            name: "select",
            children: {
              "columns": [{ language: "sql", name: "starOperator" }]
            }
          }]
        }
      };

      const candidateDesc: NodeDescription = {
        language: "sql",
        name: "select"
      };

      const validator = new Validator([GRAMMAR_SQL_DESCRIPTION]);
      const inNode = new Tree(inTreeDesc).rootNode;

      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "lhs", 0)).toBe(false);
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "select", 0)).toBe(false);
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "from", 0)).toBe(false);
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "where", 0)).toBe(false);
    });

  });

  describe(`nodeIsInSingularHole`, () => {
    it(`SQL: Components are singular, columns not`, () => {
      const inTreeDesc: NodeDescription = {
        language: "sql",
        name: "querySelect",
        children: {
          "select": [{
            language: "sql",
            name: "select",
            children: {
              "columns": [{ language: "sql", name: "starOperator" }]
            }
          }],
          "from": [{
            language: "sql",
            name: "from",
            children: {
              "tables": []
            }
          }]
        }
      };

      const validator = new Validator([GRAMMAR_SQL_DESCRIPTION]);
      const tree = new Tree(inTreeDesc);

      expect(nodeIsInSingularHole(validator, tree.locate([["select", 0]]))).toBe(true);
      expect(nodeIsInSingularHole(validator, tree.locate([["select", 0], ["columns", 0]]))).toBe(false);
      expect(nodeIsInSingularHole(validator, tree.locate([["from", 0]]))).toBe(true);
      expect(nodeIsInSingularHole(validator, tree.locate([]))).toBe(true);
    });
  });

  describe(`relativeDropLocation`, () => {
    it(`empty`, () => {
      expect(relativeDropLocation([], "block")).toEqual([]);
      expect(relativeDropLocation([], "begin")).toEqual([]);
      expect(relativeDropLocation([], "end")).toEqual([]);
    });

    it(`single level`, () => {
      expect(relativeDropLocation([["foo", 0]], "block")).toEqual([["foo", 0]]);
      expect(relativeDropLocation([["foo", 0]], "begin")).toEqual([["foo", -1]]);
      expect(relativeDropLocation([["foo", 0]], "end")).toEqual([["foo", 0]]);

      expect(relativeDropLocation([["foo", 1]], "block")).toEqual([["foo", 1]]);
      expect(relativeDropLocation([["foo", 1]], "begin")).toEqual([["foo", 0]]);
      expect(relativeDropLocation([["foo", 1]], "end")).toEqual([["foo", 1]]);

      expect(relativeDropLocation([["foo", 2]], "block")).toEqual([["foo", 2]]);
      expect(relativeDropLocation([["foo", 2]], "begin")).toEqual([["foo", 1]]);
      expect(relativeDropLocation([["foo", 2]], "end")).toEqual([["foo", 2]]);
    });

    it(`two levels`, () => {
      expect(relativeDropLocation([["bar", 0], ["foo", 0]], "block")).toEqual([["bar", 0], ["foo", 0]]);
      expect(relativeDropLocation([["bar", 0], ["foo", 0]], "begin")).toEqual([["bar", 0], ["foo", -1]]);
      expect(relativeDropLocation([["bar", 0], ["foo", 0]], "end")).toEqual([["bar", 0], ["foo", 0]]);

      expect(relativeDropLocation([["bar", 0], ["foo", 1]], "block")).toEqual([["bar", 0], ["foo", 1]]);
      expect(relativeDropLocation([["bar", 0], ["foo", 1]], "begin")).toEqual([["bar", 0], ["foo", 0]]);
      expect(relativeDropLocation([["bar", 0], ["foo", 1]], "end")).toEqual([["bar", 0], ["foo", 1]]);

      expect(relativeDropLocation([["bar", 0], ["foo", 2]], "block")).toEqual([["bar", 0], ["foo", 2]]);
      expect(relativeDropLocation([["bar", 0], ["foo", 2]], "begin")).toEqual([["bar", 0], ["foo", 1]]);
      expect(relativeDropLocation([["bar", 0], ["foo", 2]], "end")).toEqual([["bar", 0], ["foo", 2]]);
    });

    it(`copy`, () => {
      const given: NodeLocation = [["bar", 0], ["foo", 0]];
      expect(relativeDropLocation(given, "block")).toEqual(given);
      expect(relativeDropLocation(given, "block")).not.toBe(given);
    });
  });
});