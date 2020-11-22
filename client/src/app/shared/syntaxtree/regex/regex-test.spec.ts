import { runTestCase, ExecutedTestCase } from "./regex-test";

describe(`RegEx Testing`, () => {
  describe(`runTestCase`, () => {
    it("a Regex, a input, correct test case", () => {
      const result = runTestCase("a", {
        input: "a",
        expected: { type: "wholeMatch" },
      });

      expect(result).toEqual({
        input: "a",
        expected: {
          type: "exactMatch",
          hits: ["a"],
        },
        matches: ["a"],
        unexpectedMatches: [],
        result: true,
        error: "",
      });
    });

    it("empty Regex, a input, correct test case", () => {
      const result = runTestCase("", {
        input: "a",
        expected: { type: "noMatch" },
      });

      expect(result).toEqual({
        input: "a",
        expected: {
          type: "noMatch",
          hits: [],
        },
        matches: [],
        unexpectedMatches: [],
        result: true,
        error: "",
      });
    });

    it("invalid Regex, a input, incorrect test case", () => {
      const result = runTestCase("(", {
        input: "a",
        expected: { type: "noMatch" },
      });

      expect(result).toEqual({
        input: "a",
        expected: {
          type: "noMatch",
          hits: [],
        },
        matches: [],
        unexpectedMatches: [],
        result: false,
        error: "Der eingegebene Reguläre Ausdruck ist invalide.",
      });
    });

    it("b Regex, a input, correct test case", () => {
      const result = runTestCase("a", {
        input: "b",
        expected: { type: "noMatch" },
      });

      expect(result).toEqual({
        input: "b",
        expected: {
          type: "noMatch",
          hits: [],
        },
        matches: [],
        unexpectedMatches: [],
        result: true,
        error: "",
      });
    });

    it("a Regex, a input, incorrect test case", () => {
      const result = runTestCase("a", {
        input: "a",
        expected: { type: "noMatch" },
      });

      expect(result).toEqual({
        input: "a",
        expected: {
          type: "noMatch",
          hits: [],
        },
        matches: ["a"],
        unexpectedMatches: ["a"],
        result: false,
        error:
          "Es wurden unerwartete Zeichen mit dem Regulärem Ausdruck getroffen.",
      });
    });

    it("Hello Regex, Hello World input, correct test case", () => {
      const result = runTestCase("Hello", {
        input: "Hello World",
        expected: {
          type: "exactMatch",
          hits: ["Hello"],
        },
      });

      expect(result).toEqual({
        input: "Hello World",
        expected: {
          type: "exactMatch",
          hits: ["Hello"],
        },
        matches: ["Hello"],
        unexpectedMatches: [],
        result: true,
        error: "",
      });
    });

    it("a Regex, aa input, correct test case", () => {
      const result = runTestCase("a", {
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
        unexpectedMatches: [],
        result: true,
        error: "",
      });
    });

    it("^a$ Regex, aa input, incorrect test case", () => {
      const result = runTestCase("^a$", {
        input: "aa",
        expected: {
          type: "wholeMatch",
        },
      });

      expect(result).toEqual({
        input: "aa",
        expected: {
          type: "exactMatch",
          hits: ["aa"],
        },
        matches: [],
        unexpectedMatches: [],
        result: false,
        error: "Der Reguläre Ausdruck hatte keine Treffer.",
      });
    });

    it("\\w?aus Regex, Haus Maus Klaus input, incorrect test case", () => {
      const result = runTestCase("\\w?aus", {
        input: "Haus Maus Klaus",
        expected: {
          type: "exactMatch",
          hits: ["Haus", "Maus"],
        },
      });

      expect(result).toEqual({
        input: "Haus Maus Klaus",
        expected: {
          type: "exactMatch",
          hits: ["Haus", "Maus"],
        },
        matches: ["Haus", "Maus", "laus"],
        unexpectedMatches: ["laus"],
        result: false,
        error:
          "Es wurden unerwartete Zeichen mit dem Regulärem Ausdruck getroffen.",
      });
    });

    it("a|b Regex, ab input, correct test case", () => {
      const result = runTestCase("a|b", {
        input: "ab",
        expected: {
          type: "exactMatch",
          hits: ["a", "b"],
        },
      });

      expect(result).toEqual({
        input: "ab",
        expected: {
          type: "exactMatch",
          hits: ["a", "b"],
        },
        matches: ["a", "b"],
        unexpectedMatches: [],
        result: true,
        error: "",
      });
    });

    it("d Regex, 123 input, correct test case", () => {
      const result = runTestCase("\\d", {
        input: "123",
        expected: {
          type: "exactMatch",
          hits: ["1", "2", "3"],
        },
      });

      expect(result).toEqual({
        input: "123",
        expected: {
          type: "exactMatch",
          hits: ["1", "2", "3"],
        },
        matches: ["1", "2", "3"],
        unexpectedMatches: [],
        result: true,
        error: "",
      });
    });

    it("a+ Regex, aaa input, correct test case", () => {
      const result = runTestCase("a+", {
        input: "aaa",
        expected: {
          type: "exactMatch",
          hits: ["aaa"],
        },
      });

      expect(result).toEqual({
        input: "aaa",
        expected: {
          type: "exactMatch",
          hits: ["aaa"],
        },
        matches: ["aaa"],
        unexpectedMatches: [],
        result: true,
        error: "",
      });
    });

    it("telephone Regex, +31636363634 input, correct test case", () => {
      const result = runTestCase(
        "^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$",
        {
          input: "+31636363634",
          expected: {
            type: "exactMatch",
            hits: ["+31636363634"],
          },
        }
      );

      expect(result).toEqual({
        input: "+31636363634",
        expected: {
          type: "exactMatch",
          hits: ["+31636363634"],
        },
        matches: ["+31636363634"],
        unexpectedMatches: [],
        result: true,
        error: "",
      });
    });

    it("^abc$ Regex, abc input, correct test case", () => {
      const result = runTestCase("^abc$", {
        input: "abc",
        expected: {
          type: "exactMatch",
          hits: ["abc"],
        },
      });

      expect(result).toEqual({
        input: "abc",
        expected: {
          type: "exactMatch",
          hits: ["abc"],
        },
        matches: ["abc"],
        unexpectedMatches: [],
        result: true,
        error: "",
      });
    });

    it("a{1}b{1, }c{1, 2} Regex, abbbbbcc input, correct test case", () => {
      const result = runTestCase("a{1}b{1,}c{1,2}", {
        input: "abbbbbcc",
        expected: {
          type: "exactMatch",
          hits: ["abbbbbcc"],
        },
      });

      expect(result).toEqual({
        input: "abbbbbcc",
        expected: {
          type: "exactMatch",
          hits: ["abbbbbcc"],
        },
        matches: ["abbbbbcc"],
        unexpectedMatches: [],
        result: true,
        error: "",
      });
    });

    it("a(a|b)b Regex, aab input, correct test case", () => {
      const result = runTestCase("a(a|b)b", {
        input: "aab",
        expected: {
          type: "exactMatch",
          hits: ["aab", "a"],
        },
      });

      expect(result).toEqual({
        input: "aab",
        expected: {
          type: "exactMatch",
          hits: ["aab", "a"],
        },
        matches: ["aab", "a"],
        unexpectedMatches: [],
        result: true,
        error: "",
      });
    });

    it("[^a] Regex, abcd input, correct test case", () => {
      const result = runTestCase("[^a]", {
        input: "abcd",
        expected: {
          type: "exactMatch",
          hits: ["b", "c", "d"],
        },
      });

      expect(result).toEqual({
        input: "abcd",
        expected: {
          type: "exactMatch",
          hits: ["b", "c", "d"],
        },
        matches: ["b", "c", "d"],
        unexpectedMatches: [],
        result: true,
        error: "",
      });
    });

    it("email Regex, minf101710@stud.fh-wedel.de input, correct test case", () => {
      const result = runTestCase(
        '^(([^<>\\(\\)\\[\\].,;:\\s@"]+(.[^<>\\(\\)\\[\\].,;:\\s@"]+)*)|(".+"))@(([^<>\\(\\)\\[\\].,;:\\s@"]+.)+[^<>\\(\\)\\[\\].,;:\\s@"]{2,})$',
        {
          input: "minf101710@stud.fh-wedel.de",
          expected: {
            type: "wholeMatch",
          },
        }
      );

      expect(result).toEqual({
        input: "minf101710@stud.fh-wedel.de",
        expected: {
          type: "exactMatch",
          hits: ["minf101710@stud.fh-wedel.de"],
        },
        matches: ["minf101710@stud.fh-wedel.de"],
        unexpectedMatches: [],
        result: true,
        error: "",
      });
    });
  });
});
