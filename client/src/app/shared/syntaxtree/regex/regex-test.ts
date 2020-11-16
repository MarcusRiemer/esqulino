import { RegexTestCaseDescription } from "./regex-testbench.description";

/**
 * Object that represents a executed testcase and it's state
 */
export interface ExecutedTestCase extends RegexTestCaseDescription {
  input: string;
  matches: string[];
  unexpectedMatches: string[];
  result: boolean;
  error: string;
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
 * Executes a regexString and returns all matches inside the input string.
 *
 * @param regexString
 * @param input
 */
function getRegexMatches(regexString: string, input: string): string[] {
  let matches;
  let matchArrays = [];
  let regex: RegExp;

  try {
    regex = new RegExp(regexString, "g");
  } catch (e) {
    throw new Error("Error creating regular expression.");
  }

  while ((matches = regex.exec(input))) {
    for (let i = 0; i < matches.length; i++) {
      matchArrays.push(matches[i]);
    }
  }

  return matchArrays;
}

/**
 *
 * @param expectedMatches
 * @param matches
 * @param testCase
 */
function validateMatches(
  expectedMatches: string[],
  matches: string[],
  testCase: RegexTestCaseDescription
) {
  if (testCase.expected.type == "wholeMatch") {
    return matches.length > 0 && matches[0] == testCase.input;
  }
  return (
    expectedMatches.length === matches.length &&
    expectedMatches.reduce(function (prev, value, index) {
      return value === matches[index] ? prev : false;
    }, true)
  );
}

/**
 * Executes a regular expression with a supplied testcase and returns an object,
 * containing the neccescary data whether the testcase has passed and to which capacity
 *
 * @param regex
 * @param testCase
 */
export function runTestCase(
  regexString: string,
  testCase: RegexTestCaseDescription
): ExecutedTestCase {
  let errorMessage = "";
  let matches = getRegexMatches(regexString, testCase.input);
  if (matches.length == 0) {
    errorMessage = "Der Reguläre Ausdruck hatte keine Treffer.";
    let isNoMatchType = testCase.expected.type == "noMatch";
    return {
      input: testCase.input,
      matches: [],
      unexpectedMatches: [],
      result: isNoMatchType,
      expected: testCase.expected,
      error: isNoMatchType ? "" : errorMessage,
    };
  }

  // if it's a whole match, simplify it into an exact match with a single hit
  const simplifiedExpectation = simplifyExpectation(testCase);

  // redundant but the compiler keeps bugging me
  if ("hits" in simplifiedExpectation) {
    let unexpectedMatches = [];
    let expectedMatches = simplifiedExpectation.hits;
    const result = validateMatches(expectedMatches, matches, testCase);
    if (!result) {
      unexpectedMatches = expectedMatches.filter(function (value) {
        return !matches.includes(value);
      });
      if (unexpectedMatches.length > 0) {
        errorMessage =
          "Es wurden unerwartete Zeichen mit dem Regulärem Ausdruck getroffen.";
      }
    }

    return {
      input: testCase.input,
      matches: testCase.expected.type == "wholeMatch" ? [matches[0]] : matches,
      unexpectedMatches: unexpectedMatches,
      result: result,
      expected: simplifiedExpectation,
      error: errorMessage,
    };
  }

  return {
    input: testCase.input,
    matches: [],
    unexpectedMatches: [],
    result: testCase.expected.type == "noMatch",
    expected: simplifiedExpectation,
    error: "",
  };
}
