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
 * checks whether a regexString can be interpreted as a valid
 * regular expression
 *
 * @param regexString
 */
function validateRegExString(regexString: string) {
  // edge case alternative at the end let's the compilation of the regex crash
  if (regexString.slice(-1) == "|") {
    return false;
  }

  try {
    new RegExp(regexString, "g");
  } catch (e) {
    return false;
  }

  return true;
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
  // TODO aufräumen
  if (testCase.expected.type == "noMatch") {
    return matches.length == 0;
  }
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

// TODO Error messages auslagern und global verfügbar machen

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
  const isNoMatchType = testCase.expected.type == "noMatch";

  console.log("REGEX: " + regexString);

  // if it's a whole match, simplify it into an exact match with a single hit
  const simplifiedExpectation = simplifyExpectation(testCase);

  // if the regex string is empty, return and check if it's a noMatch case
  if (regexString == "") {
    return {
      input: testCase.input,
      matches: [],
      unexpectedMatches: [],
      expected: isNoMatchType
        ? { type: testCase.expected.type, hits: [] }
        : simplifiedExpectation,
      result: isNoMatchType,
      error: "",
    };
  }

  // validate the regexString and return, if invalid
  if (!validateRegExString(regexString)) {
    return {
      input: testCase.input,
      matches: [],
      unexpectedMatches: [],
      expected: isNoMatchType
        ? { type: testCase.expected.type, hits: [] }
        : simplifiedExpectation,
      result: false,
      error: "Der eingegebene Reguläre Ausdruck ist invalide.",
    };
  }

  let matches = getRegexMatches(regexString, testCase.input);
  let unexpectedMatches = [];
  let expectedMatches =
    "hits" in simplifiedExpectation ? simplifiedExpectation.hits : [];
  const result = validateMatches(expectedMatches, matches, testCase);
  if (!result) {
    unexpectedMatches = matches.filter(function (value) {
      return !expectedMatches.includes(value);
    });
    if (unexpectedMatches.length > 0) {
      errorMessage =
        "Es wurden unerwartete Zeichen mit dem Regulärem Ausdruck getroffen.";
    }
  }

  if (!isNoMatchType && matches.length == 0) {
    errorMessage = "Der Reguläre Ausdruck hatte keine Treffer.";
    return {
      input: testCase.input,
      matches: [],
      unexpectedMatches: unexpectedMatches,
      expected: simplifiedExpectation,
      result: false,
      error: errorMessage,
    };
  }

  return {
    input: testCase.input,
    matches: testCase.expected.type == "wholeMatch" ? [matches[0]] : matches,
    unexpectedMatches: unexpectedMatches,
    expected: isNoMatchType
      ? { type: testCase.expected.type, hits: [] }
      : simplifiedExpectation,
    result: result,
    error: errorMessage,
  };
}
