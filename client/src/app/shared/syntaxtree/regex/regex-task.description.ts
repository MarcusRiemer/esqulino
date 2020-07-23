/**
 * A list of testcases for regular expressions.
 */
export interface RegexTestDescription {
  cases: RegexTestCaseDescription[];
}

/**
 * A single input for a regular expression and the expected result:
 *
 * - `wholeMatch`: The regex must match the whole string
 * - `noMatch`: The regex must not match anything in the string
 * - `exactMatch`: The regex must match exactly according to the expected hits.
 */
export interface RegexTestCaseDescription {
  input: string;

  expected:
    | { type: "wholeMatch" | "noMatch" }
    | {
        type: "exactMatch";
        hits: string[];
      };
}
