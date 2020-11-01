import { RegexTestCaseDescription } from "./regex-testbench.description";

/**
 * Object that represents a executed testcase and it's state
 */
export interface ExecutedTestCase extends RegexTestCaseDescription {
  input: string;
  matches: string[];
  result: boolean;
  error: string;
  countExpectedHits: number;
  countSuccessfulHits: number;
}

/**
 * Simplifies a testcase by altering the signature of a wholeMatch to an exactMatch with a single match
 *
 * @param testCase
 */
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

/**
 * Executes a regular expression with a supplied testcase and returns an object,
 * containing the neccescary data whether the testcase has passed and to which capacity
 *
 * @param regex
 * @param testCase
 */
export function runTestCase(
  regex: RegExp,
  testCase: RegexTestCaseDescription
): ExecutedTestCase {
  // TODO: Don't return the complex matches object, return normal strings

  // execute the regular expression and get the resulting matches
  let matches = regex.exec(testCase.input);

  if (matches == null) {
    return {
      input: testCase.input,
      matches: [],
      result: testCase.expected.type == "noMatch",
      expected: testCase.expected,
      error: "",
      countSuccessfulHits: 0,
      countExpectedHits: 0,
    };
  }

  // if it's a whole match, simplify it into an exact match with a single hit
  const simplifiedExpectation = simplifyExpectation(testCase);

  // redundant but the compiler keeps bugging me
  if ("hits" in simplifiedExpectation) {
    let successfulHitCount = 0;
    const expectedMatches = simplifiedExpectation.hits;
    const result =
      expectedMatches.length === matches.length &&
      expectedMatches.every(function (value, index) {
        if (value === matches[index]) {
          successfulHitCount++;
          return true;
        }
        return false;
      });

    return {
      input: testCase.input,
      matches: matches,
      result: result,
      expected: simplifiedExpectation,
      error: "",
      countExpectedHits: simplifiedExpectation.hits.length,
      countSuccessfulHits: successfulHitCount,
    };
  }

  return {
    input: testCase.input,
    matches: [],
    result: false,
    expected: simplifiedExpectation,
    error: "Testfall, welcher Treffer erwarten sollte, besitzt keine Treffer.",
    countExpectedHits: 0,
    countSuccessfulHits: 0,
  };
}
