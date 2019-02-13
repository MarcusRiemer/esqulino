import { NodeDescription, NodeLocation } from './syntaxtree.description';
import { Tree } from './syntaxtree';
import { Validator } from './validator';
import { BOOLEAN_GRAMMAR } from './boolean-expression.spec';
import { _cardinalityAllowsInsertion, _insertAtAnyParent } from './drop-heuristic';
import { ErrorCodes } from './validation-result';

describe('Drop Heuristics', () => {
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

      const validator = new Validator([BOOLEAN_GRAMMAR]);
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

      const validator = new Validator([BOOLEAN_GRAMMAR]);
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

      const validator = new Validator([BOOLEAN_GRAMMAR]);
      const inNode = new Tree(inTreeDesc).rootNode;

      // Insertion is valid at both sides
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "lhs", 0)).toBe(true);
      expect(_cardinalityAllowsInsertion(validator, inNode, candidateDesc, "rhs", 0)).toBe(true);
    });
  });

  describe('_insertAtAnyParent', () => {
    it('(<lhs> AND <hole>), inserting <true>', () => {
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
          "operator": "AND"
        }
      };

      const candidateDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          "value": "false"
        }
      }

      const validator = new Validator([BOOLEAN_GRAMMAR]);
      const inTree = new Tree(inTreeDesc);

      // Attempt to insert at the "wrong" side, expecting to get the free side
      expect(_insertAtAnyParent(validator, inTree, [["lhs", 0]], [candidateDesc])).toEqual([
        { location: [["rhs", 0]], operation: "drop", }
      ]);

      // Attempt to insert at the "correct" side, expect to get exactly that hole
      expect(_insertAtAnyParent(validator, inTree, [["rhs", 0]], [candidateDesc])).toEqual([
        { location: [["rhs", 0]], operation: "drop", }
      ]);

      // Attempt to insert at the root itself
      expect(_insertAtAnyParent(validator, inTree, [], [candidateDesc])).toEqual([
        { location: [["rhs", 0]], operation: "drop", }
      ]);
    });

    it('(<hole> AND <hole>), inserting <true>', () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanBinary",
        children: {
          "lhs": [],
          "rhs": []
        },
        properties: {
          "operator": "AND"
        }
      };

      const candidateDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          "value": "false"
        }
      }

      const validator = new Validator([BOOLEAN_GRAMMAR]);
      const inTree = new Tree(inTreeDesc);

      // Attempt to insert at the "wrong" side, expecting to get the free side
      expect(_insertAtAnyParent(validator, inTree, [["lhs", 0]], [candidateDesc])).toEqual([
        { location: [["lhs", 0]], operation: "drop" },
        { location: [["rhs", 0]], operation: "drop" }
      ]);

      // Attempt to insert at the "correct" side, expect to get exactly that hole
      expect(_insertAtAnyParent(validator, inTree, [["rhs", 0]], [candidateDesc])).toEqual([
        { location: [["lhs", 0]], operation: "drop" },
        { location: [["rhs", 0]], operation: "drop" }
      ]);

      // Attempt to insert at the root itself
      expect(_insertAtAnyParent(validator, inTree, [], [candidateDesc])).toEqual([
        { location: [["lhs", 0]], operation: "drop" },
        { location: [["rhs", 0]], operation: "drop" }
      ]);
    });

    it('not(<hole> AND <hole>), inserting <true>', () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "negate",
        children: {
          "expr": [
            {
              language: "expr",
              name: "booleanBinary",
              children: {
                "lhs": [],
                "rhs": []
              },
              properties: {
                "operator": "AND"
              }
            }
          ]
        }
      };

      const candidateDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          "value": "false"
        }
      }

      const validator = new Validator([BOOLEAN_GRAMMAR]);
      const inTree = new Tree(inTreeDesc);

      // Attempt to insert at the "wrong" side, expecting to get the free side
      let insertLocation: NodeLocation = [["expr", 0], ["lhs", 0]];
      expect(_insertAtAnyParent(validator, inTree, insertLocation, [candidateDesc]))
        .withContext(`Inserting at ${JSON.stringify(insertLocation)}`)
        .toEqual([
          { location: [["expr", 0], ["lhs", 0]], operation: "drop" },
          { location: [["expr", 0], ["rhs", 0]], operation: "drop" }
        ], `Inserting at ${JSON.stringify(insertLocation)}`);

      // Attempt to insert at the "correct" side, expect to get exactly that hole
      insertLocation = [["expr", 0], ["rhs", 0]];
      expect(_insertAtAnyParent(validator, inTree, insertLocation, [candidateDesc]))
        .withContext(`Inserting at ${JSON.stringify(insertLocation)}`)
        .toEqual([
          { location: [["expr", 0], ["lhs", 0]], operation: "drop" },
          { location: [["expr", 0], ["rhs", 0]], operation: "drop" }
        ]);

      // Attempt to insert at the binary expression itself, this offers the
      // same two places as before
      insertLocation = [["expr", 0]];
      expect(_insertAtAnyParent(validator, inTree, insertLocation, [candidateDesc]))
        .withContext(`Inserting at ${JSON.stringify(insertLocation)}`)
        .toEqual([
          { location: [["expr", 0], ["lhs", 0]], operation: "drop" },
          { location: [["expr", 0], ["rhs", 0]], operation: "drop" }
        ]);

      // Attempt to insert at the root itself, there is no free place here
      insertLocation = [];
      expect(_insertAtAnyParent(validator, inTree, insertLocation, [candidateDesc]))
        .withContext(`Inserting at ${JSON.stringify(insertLocation)}`)
        .toEqual([]);
    });
  });
});