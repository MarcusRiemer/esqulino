import { NodeDescription } from './syntaxtree.description';
import { Tree } from './syntaxtree';
import { Validator } from './validator';
import { _cardinalityAllowsInsertion } from './drop-util';
import { GRAMMAR_BOOLEAN_DESCRIPTION } from './grammar-boolean.spec';
import { ErrorCodes } from './validation-result';

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

    it('Deals with unexpected errors', () => {

    });

  });
});