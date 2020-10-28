import { RegexTestCaseDescription } from "./regex-testbench.description";

// TODO: Pull as much non-frontend datatypes (no Observable) into this file as needed,
//       the frontend component should be a thin wrapper around these functions or data structures

export interface ExecutedTestCase extends RegexTestCaseDescription {
  // TODO: Add field for input, see TODO below about assigning the testcase
  matches: string[];
  result: boolean;
  error: string;
  // TODO: add countSuccessfulHits as property here, maybe more
}

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
  // TODO: Don't return the complex matches object, return normal strings
  let matches = regex.exec(testCase.input);

  if (matches == null) {
    // TODO: Don't use assign to mix in the testcase, instead simply assign the
    //       test case as a normal property
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

    return {
      input: testCase.input,
      expected: simplifiedExpectation,
      matches: matches,
      result: result,
      error: "",
    };
  }

  // TODO: What happens here?!
}
