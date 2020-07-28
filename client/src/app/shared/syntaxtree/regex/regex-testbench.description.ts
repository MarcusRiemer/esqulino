import { NodeDescription } from "../syntaxtree.description";
import * as AST from "../syntaxtree";

/**
 * A list of testcases for regular expressions.
 */
export interface RegexTestBenchDescription {
  cases: RegexTestCaseDescription[];
}

/**
 * - `wholeMatch`: The regex must match the whole string
 * - `noMatch`: The regex must not match anything in the string
 * - `exactMatch`: The regex must match exactly according to the expected hits.
 */
export type RegexTestCaseExpectationDescription =
  | { type: "wholeMatch" | "noMatch" }
  | {
      type: "exactMatch";
      hits: string[];
    };

/**
 * A single input for a regular expression and the expected result.
 */
export interface RegexTestCaseDescription {
  input: string;

  expected: RegexTestCaseExpectationDescription;
}

/**
 * Reads a RegEx-testbench from a Syntaxtree.
 */
export function readFromNode(ast: AST.Node): RegexTestBenchDescription {
  const toReturn = {
    cases: ast.getChildrenInCategory("cases").map(readCaseNode),
  };

  return toReturn;
}

function readCaseNode(ast: AST.Node): RegexTestCaseDescription {
  switch (ast.typeName) {
    case "caseSingle": {
      return {
        input: ast.properties["input"],
        expected: {
          // Yes, this requires a stringy comparision.
          type:
            ast.properties["wholeMatch"] === "true" ? "wholeMatch" : "noMatch",
        },
      };
    }
    case "caseHits": {
      return {
        input: ast.properties["input"],
        expected: {
          type: "exactMatch",
          hits: ast.getChildrenInCategory("hits").map(readStringNode),
        },
      };
    }
  }
}

function readStringNode(ast: AST.Node): string {
  return ast.properties["value"];
}
