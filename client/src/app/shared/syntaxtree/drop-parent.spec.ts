import { NodeDescription, NodeLocation } from "./syntaxtree.description";
import { SyntaxTree } from "./syntaxtree";
import { Validator } from "./validator";
import { GRAMMAR_BOOLEAN_DESCRIPTION } from "./grammar.spec.boolean";
import { GRAMMAR_SQL_DESCRIPTION } from "./grammar.spec.sql";
import { insertAtAnyParent, appendAtParent } from "./drop-parent";

describe("Drop Parent", () => {
  // ######################################################################

  describe("_insertAtAnyParent", () => {
    it("(TRUE AND <hole>), inserting [<true>] and [<true>,<false>]", () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanBinary",
        children: {
          lhs: [
            {
              language: "expr",
              name: "booleanConstant",
              properties: {
                value: "true",
              },
            },
          ],
          rhs: [],
        },
        properties: {
          operator: "AND",
        },
      };

      const candidateDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          value: "false",
        },
      };

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);
      const inTree = new SyntaxTree(inTreeDesc);

      // Attempt to insert at the "wrong" side, expecting to get the free side
      expect(
        insertAtAnyParent(validator, inTree, [["lhs", 0]], [candidateDesc])
      ).toEqual([
        {
          location: [["rhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: candidateDesc,
        },
      ]);

      // Attempt to insert at the "correct" side, expect to get exactly that hole
      expect(
        insertAtAnyParent(validator, inTree, [["rhs", 0]], [candidateDesc])
      ).toEqual([
        {
          location: [["rhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: candidateDesc,
        },
      ]);

      // Attempt to insert at the root itself
      expect(insertAtAnyParent(validator, inTree, [], [candidateDesc])).toEqual(
        [
          {
            location: [["rhs", 0]],
            algorithm: "allowAnyParent",
            operation: "insert",
            nodeDescription: candidateDesc,
          },
        ]
      );

      // Working with multiple candidates

      const twoCandidatesDesc = [
        candidateDesc,
        {
          language: "expr",
          name: "booleanConstant",
          properties: {
            value: "false",
          },
        },
      ];

      // Attempt to insert at the "wrong" side, expecting to get the free side
      expect(
        insertAtAnyParent(validator, inTree, [["lhs", 0]], twoCandidatesDesc)
      ).toEqual([
        {
          location: [["rhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: twoCandidatesDesc[0],
        },
        {
          location: [["rhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: twoCandidatesDesc[1],
        },
      ]);

      // Attempt to insert at the "correct" side, expect to get exactly that hole
      expect(
        insertAtAnyParent(validator, inTree, [["rhs", 0]], twoCandidatesDesc)
      ).toEqual([
        {
          location: [["rhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: twoCandidatesDesc[0],
        },
        {
          location: [["rhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: twoCandidatesDesc[1],
        },
      ]);

      // Attempt to insert at the root itself
      expect(
        insertAtAnyParent(validator, inTree, [], twoCandidatesDesc)
      ).toEqual([
        {
          location: [["rhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: twoCandidatesDesc[0],
        },
        {
          location: [["rhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: twoCandidatesDesc[1],
        },
      ]);
    });

    it("(<hole> AND <hole>), inserting [<true>] and [<true>,<false>]", () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanBinary",
        children: {
          lhs: [],
          rhs: [],
        },
        properties: {
          operator: "AND",
        },
      };

      const candidateDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          value: "false",
        },
      };

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);
      const inTree = new SyntaxTree(inTreeDesc);

      // Attempt to insert at the "wrong" side, expecting to get the free side
      expect(
        insertAtAnyParent(validator, inTree, [["lhs", 0]], [candidateDesc])
      ).toEqual([
        {
          location: [["lhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: candidateDesc,
        },
        {
          location: [["rhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: candidateDesc,
        },
      ]);

      // Attempt to insert at the "correct" side, expect to get exactly that hole
      expect(
        insertAtAnyParent(validator, inTree, [["rhs", 0]], [candidateDesc])
      ).toEqual([
        {
          location: [["lhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: candidateDesc,
        },
        {
          location: [["rhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: candidateDesc,
        },
      ]);

      // Attempt to insert at the root itself
      expect(insertAtAnyParent(validator, inTree, [], [candidateDesc])).toEqual(
        [
          {
            location: [["lhs", 0]],
            algorithm: "allowAnyParent",
            operation: "insert",
            nodeDescription: candidateDesc,
          },
          {
            location: [["rhs", 0]],
            algorithm: "allowAnyParent",
            operation: "insert",
            nodeDescription: candidateDesc,
          },
        ]
      );

      // Working with multiple candidates
      const twoCandidatesDesc = [
        candidateDesc,
        {
          language: "expr",
          name: "booleanConstant",
          properties: {
            value: "false",
          },
        },
      ];

      // Attempt to insert at the "wrong" side, expecting to get the free side
      expect(
        insertAtAnyParent(validator, inTree, [["lhs", 0]], twoCandidatesDesc)
      ).toEqual([
        {
          location: [["lhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: twoCandidatesDesc[0],
        },
        {
          location: [["rhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: twoCandidatesDesc[0],
        },
        {
          location: [["lhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: twoCandidatesDesc[1],
        },
        {
          location: [["rhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: twoCandidatesDesc[1],
        },
      ]);

      // Attempt to insert at the "correct" side, expect to get exactly that hole
      expect(
        insertAtAnyParent(validator, inTree, [["rhs", 0]], twoCandidatesDesc)
      ).toEqual([
        {
          location: [["lhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: twoCandidatesDesc[0],
        },
        {
          location: [["rhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: twoCandidatesDesc[0],
        },
        {
          location: [["lhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: twoCandidatesDesc[1],
        },
        {
          location: [["rhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: twoCandidatesDesc[1],
        },
      ]);

      // Attempt to insert at the root itself
      expect(
        insertAtAnyParent(validator, inTree, [], twoCandidatesDesc)
      ).toEqual([
        {
          location: [["lhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: twoCandidatesDesc[0],
        },
        {
          location: [["rhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: twoCandidatesDesc[0],
        },
        {
          location: [["lhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: twoCandidatesDesc[1],
        },
        {
          location: [["rhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: twoCandidatesDesc[1],
        },
      ]);
    });

    it("not(<hole> AND <hole>), inserting <true>", () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "negate",
        children: {
          expr: [
            {
              language: "expr",
              name: "booleanBinary",
              children: {
                lhs: [],
                rhs: [],
              },
              properties: {
                operator: "AND",
              },
            },
          ],
        },
      };

      const candidateDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          value: "false",
        },
      };

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);
      const inTree = new SyntaxTree(inTreeDesc);

      // Attempt to insert at the "wrong" side, expecting to get the free side
      let insertLocation: NodeLocation = [
        ["expr", 0],
        ["lhs", 0],
      ];
      expect(
        insertAtAnyParent(validator, inTree, insertLocation, [candidateDesc])
      )
        .withContext(`Inserting at ${JSON.stringify(insertLocation)}`)
        .toEqual(
          [
            {
              location: [
                ["expr", 0],
                ["lhs", 0],
              ],
              algorithm: "allowAnyParent",
              operation: "insert",
              nodeDescription: candidateDesc,
            },
            {
              location: [
                ["expr", 0],
                ["rhs", 0],
              ],
              algorithm: "allowAnyParent",
              operation: "insert",
              nodeDescription: candidateDesc,
            },
          ],
          `Inserting at ${JSON.stringify(insertLocation)}`
        );

      // Attempt to insert at the "correct" side, expect to get exactly that hole
      insertLocation = [
        ["expr", 0],
        ["rhs", 0],
      ];
      expect(
        insertAtAnyParent(validator, inTree, insertLocation, [candidateDesc])
      )
        .withContext(`Inserting at ${JSON.stringify(insertLocation)}`)
        .toEqual([
          {
            location: [
              ["expr", 0],
              ["lhs", 0],
            ],
            algorithm: "allowAnyParent",
            operation: "insert",
            nodeDescription: candidateDesc,
          },
          {
            location: [
              ["expr", 0],
              ["rhs", 0],
            ],
            algorithm: "allowAnyParent",
            operation: "insert",
            nodeDescription: candidateDesc,
          },
        ]);

      // Attempt to insert at the binary expression itself, this offers the
      // same two places as before
      insertLocation = [["expr", 0]];
      expect(
        insertAtAnyParent(validator, inTree, insertLocation, [candidateDesc])
      )
        .withContext(`Inserting at ${JSON.stringify(insertLocation)}`)
        .toEqual([
          {
            location: [
              ["expr", 0],
              ["lhs", 0],
            ],
            algorithm: "allowAnyParent",
            operation: "insert",
            nodeDescription: candidateDesc,
          },
          {
            location: [
              ["expr", 0],
              ["rhs", 0],
            ],
            algorithm: "allowAnyParent",
            operation: "insert",
            nodeDescription: candidateDesc,
          },
        ]);

      // Attempt to insert at the root itself, there is no free place here
      insertLocation = [];
      expect(
        insertAtAnyParent(validator, inTree, insertLocation, [candidateDesc])
      )
        .withContext(`Inserting at ${JSON.stringify(insertLocation)}`)
        .toEqual([]);
    });

    it(`((<hole> AND <hole>) OR <hole>), insert <true>`, () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanBinary",
        children: {
          lhs: [
            {
              language: "expr",
              name: "booleanBinary",
              children: {
                lhs: [],
                rhs: [],
              },
              properties: {
                operator: "AND",
              },
            },
          ],
          rhs: [],
        },
        properties: {
          operator: "OR",
        },
      };

      const candidateDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          value: "true",
        },
      };

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);
      const inTree = new SyntaxTree(inTreeDesc);

      // Dropping on "AND"
      expect(
        insertAtAnyParent(validator, inTree, [["lhs", 0]], [candidateDesc])
      ).toEqual([
        {
          location: [
            ["lhs", 0],
            ["lhs", 0],
          ],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: candidateDesc,
        },
        {
          location: [
            ["lhs", 0],
            ["rhs", 0],
          ],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: candidateDesc,
        },
        {
          location: [["rhs", 0]],
          algorithm: "allowAnyParent",
          operation: "insert",
          nodeDescription: candidateDesc,
        },
      ]);

      // Dropping on root "OR"
      expect(insertAtAnyParent(validator, inTree, [], [candidateDesc])).toEqual(
        [
          {
            location: [["rhs", 0]],
            algorithm: "allowAnyParent",
            operation: "insert",
            nodeDescription: candidateDesc,
          },
        ]
      );
    });
  });

  describe(`appendAtParent`, () => {
    it(`SQL: Insert new column with "SELECT *"`, () => {
      const inTreeDesc: NodeDescription = {
        language: "sql",
        name: "querySelect",
        children: {
          select: [
            {
              language: "sql",
              name: "select",
              children: {
                columns: [{ language: "sql", name: "starOperator" }],
              },
            },
          ],
        },
      };

      const candidatesDesc: NodeDescription[] = [
        {
          language: "sql",
          name: "columnName",
          properties: {
            value: "false",
          },
        },
      ];

      const validator = new Validator([GRAMMAR_SQL_DESCRIPTION]);
      const inTree = new SyntaxTree(inTreeDesc);

      let loc: NodeLocation = [
        ["select", 0],
        ["columns", 0],
      ];
      expect(appendAtParent(validator, inTree, loc, candidatesDesc))
        .withContext(`Location: ${JSON.stringify(loc)}`)
        .toEqual([
          {
            location: [
              ["select", 0],
              ["columns", 1],
            ],
            algorithm: "allowAnyParent",
            operation: "insert",
            nodeDescription: candidatesDesc[0],
          },
        ]);

      loc = [
        ["select", 0],
        ["columns", 1],
      ];
      expect(appendAtParent(validator, inTree, loc, candidatesDesc))
        .withContext(`Location does not exist: ${JSON.stringify(loc)}`)
        .toEqual([]);

      loc = [["select", 0]];
      expect(appendAtParent(validator, inTree, loc, candidatesDesc))
        .withContext(`Location: ${JSON.stringify(loc)}`)
        .toEqual([]);

      loc = [];
      expect(appendAtParent(validator, inTree, loc, candidatesDesc))
        .withContext(`Location: ${JSON.stringify(loc)}`)
        .toEqual([]);
    });

    it(`SQL: Insert new column with "SELECT t.a, t.b, t.c"`, () => {
      const inTreeDesc: NodeDescription = {
        language: "sql",
        name: "querySelect",
        children: {
          select: [
            {
              language: "sql",
              name: "select",
              children: {
                columns: [
                  {
                    language: "sql",
                    name: "columName",
                    properties: {
                      columnName: "a",
                      refTableName: "t",
                    },
                  },
                  {
                    language: "sql",
                    name: "columName",
                    properties: {
                      columnName: "b",
                      refTableName: "t",
                    },
                  },
                  {
                    language: "sql",
                    name: "columName",
                    properties: {
                      columnName: "c",
                      refTableName: "t",
                    },
                  },
                ],
              },
            },
          ],
        },
      };

      const candidatesDesc: NodeDescription[] = [
        {
          language: "sql",
          name: "columnName",
          properties: {
            value: "false",
          },
        },
      ];

      const validator = new Validator([GRAMMAR_SQL_DESCRIPTION]);
      const inTree = new SyntaxTree(inTreeDesc);

      let loc: NodeLocation = [
        ["select", 0],
        ["columns", 0],
      ];
      expect(appendAtParent(validator, inTree, loc, candidatesDesc))
        .withContext(`Location: ${JSON.stringify(loc)}`)
        .toEqual([
          {
            location: [
              ["select", 0],
              ["columns", 1],
            ],
            algorithm: "allowAnyParent",
            operation: "insert",
            nodeDescription: candidatesDesc[0],
          },
        ]);

      loc = [
        ["select", 0],
        ["columns", 1],
      ];
      expect(appendAtParent(validator, inTree, loc, candidatesDesc))
        .withContext(`Location: ${JSON.stringify(loc)}`)
        .toEqual([
          {
            location: [
              ["select", 0],
              ["columns", 2],
            ],
            algorithm: "allowAnyParent",
            operation: "insert",
            nodeDescription: candidatesDesc[0],
          },
        ]);

      loc = [
        ["select", 0],
        ["columns", 2],
      ];
      expect(appendAtParent(validator, inTree, loc, candidatesDesc))
        .withContext(`Location: ${JSON.stringify(loc)}`)
        .toEqual([
          {
            location: [
              ["select", 0],
              ["columns", 3],
            ],
            algorithm: "allowAnyParent",
            operation: "insert",
            nodeDescription: candidatesDesc[0],
          },
        ]);

      loc = [
        ["select", 0],
        ["columns", 3],
      ];
      expect(appendAtParent(validator, inTree, loc, candidatesDesc))
        .withContext(`Location: ${JSON.stringify(loc)}`)
        .toEqual([]);
    });
  });
});
