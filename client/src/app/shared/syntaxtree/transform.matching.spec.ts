import { NodeLocation, SyntaxNode, SyntaxTree } from "./syntaxtree";
import { Selector } from "./transform.description";
import { findMatches } from "./transform.matching";
import * as RegexTemplates from "./transform.templates";

describe("Finding matchings of selectors on trees", () => {
  it("Matching a root character node", () => {
    const testInput = new SyntaxTree({
      name: "char",
      language: "regex",
    }).rootNode;

    const testSelector = RegexTemplates.SelectorRegexChar;
    const result = findMatches(testInput, testSelector);
    expect(result).toEqual([[]]);
  });

  it("Matching children character nodes", () => {
    const testInput = new SyntaxTree({
      name: "invis-container",
      language: "regex",
      children: {
        elements: [
          {
            name: "set",
            language: "regex",
            children: {
              setNegation: [],
              elements: [
                {
                  name: "range",
                  language: "regex",
                  children: {
                    firstElement: [
                      {
                        name: "char",
                        language: "regex",
                        properties: {
                          value: "1",
                        },
                      },
                    ],
                    lastElement: [
                      {
                        name: "char",
                        language: "regex",
                        properties: {
                          value: "9",
                        },
                      },
                    ],
                  },
                },
                {
                  name: "string",
                  language: "regex",
                  properties: {
                    value: "name",
                  },
                },
              ],
            },
          },
        ],
      },
    }).rootNode;

    const testSelector = RegexTemplates.SelectorRegexChar;

    //
    const result = findMatches(testInput, testSelector);
    expect(result).toEqual([
      [
        ["elements", 0],
        ["elements", 0],
        ["firstElement", 0],
      ],
      [
        ["elements", 0],
        ["elements", 0],
        ["lastElement", 0],
      ],
    ]);
  });

  it("Matching children string nodes", () => {
    const testInput = new SyntaxTree({
      name: "invis-container",
      language: "regex",
      children: {
        elements: [
          {
            name: "set",
            language: "regex",
            children: {
              setNegation: [],
              elements: [
                {
                  name: "range",
                  language: "regex",
                  children: {
                    firstElement: [
                      {
                        name: "char",
                        language: "regex",
                        properties: {
                          value: "1",
                        },
                      },
                    ],
                    lastElement: [
                      {
                        name: "char",
                        language: "regex",
                        properties: {
                          value: "9",
                        },
                      },
                    ],
                  },
                },
                {
                  name: "string",
                  language: "regex",
                  properties: {
                    value: "name",
                  },
                },
              ],
            },
          },
          {
            name: "string",
            language: "regex",
            properties: {
              value: "address",
            },
          },
        ],
      },
    }).rootNode;

    const testSelector = RegexTemplates.SelectorRegexString;

    debugger;
    const result = findMatches(testInput, testSelector);
    expect(result).toEqual([
      [
        ["elements", 0],
        ["elements", 1],
      ],
      [["elements", 1]],
    ]);
  });
});
