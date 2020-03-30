import { NodeDescription, Validator, Tree } from "../../../shared/syntaxtree";
import { GRAMMAR_BOOLEAN_DESCRIPTION } from "../../../shared/syntaxtree/grammar.spec.boolean";
import { _isChildRequiredSchema } from "./drop-target-state";

describe("Drop Target State", () => {
  describe("isChildRequired", () => {
    it("EmptyTree)", () => {
      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);
      const inTree = new Tree(undefined);

      expect(_isChildRequiredSchema(validator, inTree, []))
        .withContext("Empty trees always want insertion at the root")
        .toBe(true);
      expect(_isChildRequiredSchema(validator, inTree, [["lhs", 0]]))
        .withContext(
          "Unknown parent, we don't assume something should be inserted"
        )
        .toBe(false);
      expect(
        _isChildRequiredSchema(validator, inTree, [
          ["lhs", 0],
          ["expr", 0],
        ])
      )
        .withContext(
          "Unknown parent, we don't assume something should be inserted"
        )
        .toBe(false);
    });

    it("(TRUE AND <hole>)", () => {
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

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);
      const inTree = new Tree(inTreeDesc);

      expect(_isChildRequiredSchema(validator, inTree, []))
        .withContext("Non empty trees don't want insertions")
        .toBe(false);
      expect(
        _isChildRequiredSchema(validator, inTree, [
          ["lhs", 0],
          ["expr", 0],
        ])
      )
        .withContext(
          "Unknown parent, we don't assume something should be inserted"
        )
        .toBe(false);

      expect(_isChildRequiredSchema(validator, inTree, [["lhs", 0]]))
        .withContext("lhs is filled")
        .toBe(false);
      expect(_isChildRequiredSchema(validator, inTree, [["rhs", 0]]))
        .withContext("rhs is empty")
        .toBe(true);
      expect(_isChildRequiredSchema(validator, inTree, [["nonexistant", 0]]))
        .withContext("Non existant categories are never required")
        .toBe(false);
    });

    it("(<hole> AND <hole>)", () => {
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

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);
      const inTree = new Tree(inTreeDesc);

      expect(_isChildRequiredSchema(validator, inTree, [["lhs", 0]]))
        .withContext("lhs is empty")
        .toBe(true);
      expect(_isChildRequiredSchema(validator, inTree, [["rhs", 0]]))
        .withContext("rhs is empty")
        .toBe(true);
      expect(_isChildRequiredSchema(validator, inTree, [["nonexistant", 0]]))
        .withContext("Non existant categories are never required")
        .toBe(false);
    });
  });
});
