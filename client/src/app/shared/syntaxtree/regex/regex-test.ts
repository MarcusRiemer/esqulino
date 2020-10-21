import { RegexTestCaseDescription } from "./regex-testbench.description";
import { ExecutedTestCase } from "../../../editor/code/regex/regex-test.component";

function simplifyExpectation(
  testCase: RegexTestCaseDescription
): RegexTestCaseDescription["expected"] {
  switch (testCase.expected.type) {
    case "wholeMatch": {
      return {
        type: "exactMatch",
        hits: [testCase.input],
      };
    }
    default: {
      return testCase.expected;
    }
  }
}

export function runTestCase(
  regex: RegExp,
  testCase: RegexTestCaseDescription
): ExecutedTestCase {
  let matches = regex.exec(testCase.input);

  if (matches == null) {
    return Object.assign({}, testCase, {
      matches: [],
      result: testCase.expected.type == "noMatch",
      error: "",
    });
  }

  const simplifiedExpectation = simplifyExpectation(testCase);
  // redundant but the compiler keeps bugging me
  if ("hits" in simplifiedExpectation) {
    const expectedMatches = simplifiedExpectation.hits;
    const result =
      expectedMatches.length === matches.length &&
      expectedMatches.every((value, index) => value === matches[index]);

    return Object.assign(
      {},
      {
        input: testCase.input,
        expected: simplifiedExpectation,
        matches: matches,
        result: result,
        error: "",
      }
    );
  }
}
