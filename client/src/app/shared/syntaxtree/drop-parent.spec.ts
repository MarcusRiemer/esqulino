import { NodeDescription, NodeLocation } from './syntaxtree.description';
import { Tree } from './syntaxtree';
import { Validator } from './validator';
import { BOOLEAN_GRAMMAR } from './boolean-expression.spec';
import { insertAtAnyParent } from './drop-parent';

describe('Drop Parent', () => {

  // ######################################################################

  describe('_insertAtAnyParent', () => {
    it('(<lhs> AND <hole>), inserting [<true>] and [<true>,<false>]', () => {
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
      expect(insertAtAnyParent(validator, inTree, [["lhs", 0]], [candidateDesc])).toEqual([
        { location: [["rhs", 0]], operation: "insert", nodeDescription: candidateDesc }
      ]);

      // Attempt to insert at the "correct" side, expect to get exactly that hole
      expect(insertAtAnyParent(validator, inTree, [["rhs", 0]], [candidateDesc])).toEqual([
        { location: [["rhs", 0]], operation: "insert", nodeDescription: candidateDesc }
      ]);

      // Attempt to insert at the root itself
      expect(insertAtAnyParent(validator, inTree, [], [candidateDesc])).toEqual([
        { location: [["rhs", 0]], operation: "insert", nodeDescription: candidateDesc }
      ]);

      // Working with multiple candidates

      const twoCandidatesDesc = [candidateDesc, {
        language: "expr",
        name: "booleanConstant",
        properties: {
          "value": "false"
        }
      }];

      // Attempt to insert at the "wrong" side, expecting to get the free side
      expect(insertAtAnyParent(validator, inTree, [["lhs", 0]], twoCandidatesDesc)).toEqual([
        { location: [["rhs", 0]], operation: "insert", nodeDescription: twoCandidatesDesc[0] },
        { location: [["rhs", 0]], operation: "insert", nodeDescription: twoCandidatesDesc[1] }
      ]);

      // Attempt to insert at the "correct" side, expect to get exactly that hole
      expect(insertAtAnyParent(validator, inTree, [["rhs", 0]], twoCandidatesDesc)).toEqual([
        { location: [["rhs", 0]], operation: "insert", nodeDescription: twoCandidatesDesc[0] },
        { location: [["rhs", 0]], operation: "insert", nodeDescription: twoCandidatesDesc[1] }
      ]);

      // Attempt to insert at the root itself
      expect(insertAtAnyParent(validator, inTree, [], twoCandidatesDesc)).toEqual([
        { location: [["rhs", 0]], operation: "insert", nodeDescription: twoCandidatesDesc[0] },
        { location: [["rhs", 0]], operation: "insert", nodeDescription: twoCandidatesDesc[1] }
      ]);

    });

    it('(<hole> AND <hole>), inserting [<true>] and [<true>,<false>]', () => {
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
      expect(insertAtAnyParent(validator, inTree, [["lhs", 0]], [candidateDesc])).toEqual([
        { location: [["lhs", 0]], operation: "insert", nodeDescription: candidateDesc },
        { location: [["rhs", 0]], operation: "insert", nodeDescription: candidateDesc }
      ]);

      // Attempt to insert at the "correct" side, expect to get exactly that hole
      expect(insertAtAnyParent(validator, inTree, [["rhs", 0]], [candidateDesc])).toEqual([
        { location: [["lhs", 0]], operation: "insert", nodeDescription: candidateDesc },
        { location: [["rhs", 0]], operation: "insert", nodeDescription: candidateDesc }
      ]);

      // Attempt to insert at the root itself
      expect(insertAtAnyParent(validator, inTree, [], [candidateDesc])).toEqual([
        { location: [["lhs", 0]], operation: "insert", nodeDescription: candidateDesc },
        { location: [["rhs", 0]], operation: "insert", nodeDescription: candidateDesc }
      ]);

      // Working with multiple candidates
      const twoCandidatesDesc = [candidateDesc, {
        language: "expr",
        name: "booleanConstant",
        properties: {
          "value": "false"
        }
      }];

      // Attempt to insert at the "wrong" side, expecting to get the free side
      expect(insertAtAnyParent(validator, inTree, [["lhs", 0]], twoCandidatesDesc)).toEqual([
        { location: [["lhs", 0]], operation: "insert", nodeDescription: twoCandidatesDesc[0] },
        { location: [["rhs", 0]], operation: "insert", nodeDescription: twoCandidatesDesc[0] },
        { location: [["lhs", 0]], operation: "insert", nodeDescription: twoCandidatesDesc[1] },
        { location: [["rhs", 0]], operation: "insert", nodeDescription: twoCandidatesDesc[1] }
      ]);

      // Attempt to insert at the "correct" side, expect to get exactly that hole
      expect(insertAtAnyParent(validator, inTree, [["rhs", 0]], twoCandidatesDesc)).toEqual([
        { location: [["lhs", 0]], operation: "insert", nodeDescription: twoCandidatesDesc[0] },
        { location: [["rhs", 0]], operation: "insert", nodeDescription: twoCandidatesDesc[0] },
        { location: [["lhs", 0]], operation: "insert", nodeDescription: twoCandidatesDesc[1] },
        { location: [["rhs", 0]], operation: "insert", nodeDescription: twoCandidatesDesc[1] }
      ]);

      // Attempt to insert at the root itself
      expect(insertAtAnyParent(validator, inTree, [], twoCandidatesDesc)).toEqual([
        { location: [["lhs", 0]], operation: "insert", nodeDescription: twoCandidatesDesc[0] },
        { location: [["rhs", 0]], operation: "insert", nodeDescription: twoCandidatesDesc[0] },
        { location: [["lhs", 0]], operation: "insert", nodeDescription: twoCandidatesDesc[1] },
        { location: [["rhs", 0]], operation: "insert", nodeDescription: twoCandidatesDesc[1] }
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
      expect(insertAtAnyParent(validator, inTree, insertLocation, [candidateDesc]))
        .withContext(`Inserting at ${JSON.stringify(insertLocation)}`)
        .toEqual([
          { location: [["expr", 0], ["lhs", 0]], operation: "insert", nodeDescription: candidateDesc },
          { location: [["expr", 0], ["rhs", 0]], operation: "insert", nodeDescription: candidateDesc }
        ], `Inserting at ${JSON.stringify(insertLocation)}`);

      // Attempt to insert at the "correct" side, expect to get exactly that hole
      insertLocation = [["expr", 0], ["rhs", 0]];
      expect(insertAtAnyParent(validator, inTree, insertLocation, [candidateDesc]))
        .withContext(`Inserting at ${JSON.stringify(insertLocation)}`)
        .toEqual([
          { location: [["expr", 0], ["lhs", 0]], operation: "insert", nodeDescription: candidateDesc },
          { location: [["expr", 0], ["rhs", 0]], operation: "insert", nodeDescription: candidateDesc }
        ]);

      // Attempt to insert at the binary expression itself, this offers the
      // same two places as before
      insertLocation = [["expr", 0]];
      expect(insertAtAnyParent(validator, inTree, insertLocation, [candidateDesc]))
        .withContext(`Inserting at ${JSON.stringify(insertLocation)}`)
        .toEqual([
          { location: [["expr", 0], ["lhs", 0]], operation: "insert", nodeDescription: candidateDesc },
          { location: [["expr", 0], ["rhs", 0]], operation: "insert", nodeDescription: candidateDesc }
        ]);

      // Attempt to insert at the root itself, there is no free place here
      insertLocation = [];
      expect(insertAtAnyParent(validator, inTree, insertLocation, [candidateDesc]))
        .withContext(`Inserting at ${JSON.stringify(insertLocation)}`)
        .toEqual([]);
    });
  });
});
