import { runTestCase, ExecutedTestCase } from "./regex-test";

describe(`RegEx Testing`, () => {
  describe(`runTestCase`, () => {
    it("a Regex, a input, correct test case", () => {
      const result = runTestCase(/a/, {
        input: "a",
        expected: { type: "wholeMatch" },
      });

      expect(result).toEqual({
        input: "a",
        expected: { type: "wholeMatch" },
        matches: ["a"],
        result: true,
        error: "",
        countSuccessfulHits: 1,
        countExpectedHits: 1,
      });
    });

    it("a Regex, aa input, correct test case", () => {
      const result = runTestCase(/a/, {
        input: "aa",
        expected: {
          type: "exactMatch",
          hits: ["a", "a"],
        },
      });

      expect(result).toEqual({
        input: "aa",
        expected: {
          type: "exactMatch",
          hits: ["a", "a"],
        },
        matches: ["a", "a"],
        result: false,
        error: "",
        countSuccessfulHits: 0,
        countExpectedHits: 2,
      });
    });
  });
});
