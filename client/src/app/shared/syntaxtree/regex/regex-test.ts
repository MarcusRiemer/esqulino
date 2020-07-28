import { RegexTestCaseDescription } from "./regex-testbench.description";

function simplifyMatch(
  testCase: RegexTestCaseDescription
): RegexTestCaseDescription["expected"] {
  switch (testCase.expected.type) {
    case "wholeMatch": {
      return {
        type: "exactMatch",
        hits: [testCase.input],
      };
    }
  }
}

// TODO: Maybe also return list of results
export function runTestCase(
  regex: RegExp,
  testCase: RegexTestCaseDescription
): boolean {
  return true;
}
