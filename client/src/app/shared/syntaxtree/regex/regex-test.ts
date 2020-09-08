import { RegexTestCaseDescription } from "./regex-task.description";
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
      error: ""
    });
  }

  console.log("matches: " + matches);

  let testRegex = new RegExp("xbc|de").exec("abcde");
  console.log("testRegex: " + testRegex);

  // TODO test and make sure this is fine by doing a lot of dedicated testcases

  const simplifiedExpectation = simplifyExpectation(testCase);
  // redundant but the compiler keeps bugging me
  if ("hits" in simplifiedExpectation) {
    const expectedMatches = simplifiedExpectation.hits;
    const result =
      expectedMatches.length === matches.length &&
      expectedMatches.every((value, index) => value === matches[index]);

    return Object.assign({}, {
      input: testCase.input,
      expected: simplifiedExpectation,
      matches: matches,
      result: result,
      error: ""
    });
  }
}
