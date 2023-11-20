import { NodeLocation, SyntaxNode, SyntaxTree } from "./syntaxtree";
import { Selector } from "./transform.description";
import { findMatches } from "./transform.matching";
import * as RegexTemplates from "./transform.rules.regex";

describe("Finding matchings of selectors on trees", () => {
  describe("Matching against the not type Selector", () => {
    it("Matching all non char nodes", () => {
      const testInput = new SyntaxTree({
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            {
              name: "builtInQuantifier",
              language: "regex",
              properties: {
                symbol: "+",
              },
              children: {
                elements: [
                  {
                    name: "string",
                    language: "regex",
                    properties: {
                      value: "abcd",
                    },
                  },
                ],
              },
            },
            {
              name: "set",
              language: "regex",
              children: {
                setNegation: [
                  {
                    name: "setNegation",
                    language: "regex",
                  },
                ],
                elements: [
                  {
                    name: "char",
                    language: "regex",
                    properties: {
                      value: "t",
                    },
                  },
                  {
                    name: "string",
                    language: "regex",
                    properties: {
                      value: "t",
                    },
                  },
                ],
              },
            },
          ],
        },
      });

      const testSelector: Selector = {
        kind: "negate",
        selector: {
          kind: "type",
          language: "regex",
          name: "char",
        },
      };
      const matches = findMatches(testInput.rootNode, testSelector);

      const result: NodeLocation[] = [
        [
          ["elements", 0],
          ["elements", 0],
        ],
        [["elements", 0]],
        [
          ["elements", 1],
          ["setNegation", 0],
        ],
        [
          ["elements", 1],
          ["elements", 1],
        ],
        [["elements", 1]],
        [],
      ];
      //debugger;
      expect(matches).toEqual(result);
    });
  });

  // TODO: Add a test case for the notName of the "type" Selector
  describe("Matching against the type selector", () => {
    it("Matching a root char node", () => {
      const testInput = new SyntaxTree({
        name: "char",
        language: "regex",
      });

      const testSelector: Selector = {
        kind: "type",
        language: "regex",
        name: "char",
      };
      const matches = findMatches(testInput.rootNode, testSelector);

      const result: NodeLocation[] = [[]];
      expect(matches).toEqual(result);
    });

    it("Matching children char nodes", () => {
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
      });

      const testSelector: Selector = {
        kind: "type",
        language: "regex",
        name: "char",
      };
      const result: NodeLocation[] = [
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
      ];
      //
      const matches = findMatches(testInput.rootNode, testSelector);
      expect(matches).toEqual(result);
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
      });

      const testSelector: Selector = {
        kind: "type",
        language: "regex",
        name: "string",
      };
      const result: NodeLocation[] = [
        [
          ["elements", 0],
          ["elements", 1],
        ],
        [["elements", 1]],
      ];

      const matches = findMatches(testInput.rootNode, testSelector);
      expect(matches).toEqual(result);
    });
  });

  describe("Matching against the any-selector", () => {
    it("Matching children with any-selectors", () => {
      const testInput = new SyntaxTree({
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            {
              name: "alternation",
              language: "regex",
              children: {
                alternatives: [
                  {
                    name: "string",
                    language: "regex",
                    properties: {
                      value: "abc",
                    },
                  },
                  {
                    name: "char",
                    language: "regex",
                    properties: {
                      value: "aa",
                    },
                  },
                ],
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "abc",
              },
            },
            {
              name: "metaChar",
              language: "regex",
              properties: {
                value: ".",
              },
            },
            {
              name: "char",
              language: "regex",
              properties: {
                value: "aa",
              },
            },
          ],
        },
      });

      const testSelector: Selector = {
        kind: "any",
        selectors: [
          {
            kind: "type",
            language: "regex",
            name: "char",
          },
          {
            kind: "type",
            language: "regex",
            name: "string",
          },
        ],
      };

      const result: NodeLocation[] = [
        [
          ["elements", 0],
          ["alternatives", 0],
        ],
        [
          ["elements", 0],
          ["alternatives", 1],
        ],
        [["elements", 1]],
        [["elements", 3]],
      ];

      //debugger;
      const matches = findMatches(testInput.rootNode, testSelector);
      expect(matches).toEqual(result);
    });

    it("Matching nothing with empty any-selectors", () => {
      const testInput = new SyntaxTree({
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            {
              name: "alternation",
              language: "regex",
              children: {
                alternatives: [
                  {
                    name: "string",
                    language: "regex",
                    properties: {
                      value: "abc",
                    },
                  },
                  {
                    name: "char",
                    language: "regex",
                    properties: {
                      value: "aa",
                    },
                  },
                ],
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "abc",
              },
            },
            {
              name: "metaChar",
              language: "regex",
              properties: {
                value: ".",
              },
            },
            {
              name: "char",
              language: "regex",
              properties: {
                value: "aa",
              },
            },
          ],
        },
      });

      const testSelector: Selector = {
        kind: "any",
        selectors: [],
      };

      const result: NodeLocation[] = [];

      //debugger;
      const matches = findMatches(testInput.rootNode, testSelector);
      expect(matches).toEqual(result);
    });
  });

  describe("Matching against the all-selector", () => {
    it("Matching children with all-selectors", () => {
      const testInput = new SyntaxTree({
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            {
              name: "alternation",
              language: "regex",
              children: {
                alternatives: [
                  {
                    name: "string",
                    language: "regex",
                    properties: {
                      value: "abc",
                    },
                  },
                  {
                    name: "char",
                    language: "regex",
                    properties: {
                      value: "aa",
                    },
                  },
                ],
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "abc",
              },
            },
            {
              name: "metaChar",
              language: "regex",
              properties: {
                value: ".",
              },
            },
            {
              name: "char",
              language: "regex",
              properties: {
                value: "aa",
              },
            },
          ],
        },
      });

      // An all selector that matches char nodes with property length > 1
      const testSelector: Selector = {
        kind: "all",
        selectors: [
          {
            kind: "type",
            language: "regex",
            name: "char",
          },
          {
            kind: "property-simple",
            name: "value",
            propertyValueMinLength: 2,
          },
        ],
      };

      const result: NodeLocation[] = [
        [
          ["elements", 0],
          ["alternatives", 1],
        ],
        [["elements", 3]],
      ];

      //debugger;
      const matches = findMatches(testInput.rootNode, testSelector);
      expect(matches).toEqual(result);
    });

    it("Matching nothing with empty all-selectors", () => {
      const testInput = new SyntaxTree({
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            {
              name: "alternation",
              language: "regex",
              children: {
                alternatives: [
                  {
                    name: "string",
                    language: "regex",
                    properties: {
                      value: "abc",
                    },
                  },
                  {
                    name: "char",
                    language: "regex",
                    properties: {
                      value: "aa",
                    },
                  },
                ],
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "abc",
              },
            },
            {
              name: "metaChar",
              language: "regex",
              properties: {
                value: ".",
              },
            },
            {
              name: "char",
              language: "regex",
              properties: {
                value: "aa",
              },
            },
          ],
        },
      });

      const testSelector: Selector = {
        kind: "all",
        selectors: [],
      };

      const result: NodeLocation[] = [];

      //debugger;
      const matches = findMatches(testInput.rootNode, testSelector);
      expect(matches).toEqual(result);
    });
  });

  it("Matching immediate char node, child of an alternation with an immediate-child selector", () => {
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
              ],
            },
          },
          {
            name: "alternation",
            language: "regex",
            children: {
              alternatives: [
                {
                  name: "string",
                  language: "regex",
                  properties: {
                    value: "abc",
                  },
                },
                {
                  name: "char",
                  language: "regex",
                  properties: {
                    value: "aa",
                  },
                },
              ],
            },
          },
        ],
      },
    });

    const testSelector: Selector = {
      kind: "immediateChild",
      parent: {
        kind: "type",
        name: "alternation",
      },
      child: {
        kind: "type",
        language: "regex",
        name: "char",
      },
    };
    const matches = findMatches(testInput.rootNode, testSelector);

    //debugger;
    // The immediateChild Selector, when matched, gvies back the parent's node location.
    const result: NodeLocation[] = [[["elements", 1], ["alternatives", 1]]];
    expect(matches).toEqual(result);
  });

  describe("Matching against the property Selector", () => {
    it("Matching against a minlength simple property Selector", () => {
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
                            value: "g",
                          },
                        },
                      ],
                      lastElement: [
                        {
                          name: "char",
                          language: "regex",
                          properties: {
                            value: "o",
                          },
                        },
                      ],
                    },
                  },
                  {
                    name: "char",
                    language: "regex",
                    properties: {
                      value: "123",
                    },
                  },
                ],
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "ab",
              },
            },
            {
              name: "char",
              language: "regex",
              properties: {
                value: "cd",
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "foo",
              },
            },
          ],
        },
      });

      const testSelector: Selector = {
        kind: "property-simple",
        name: "value",
        propertyValueMinLength: 3,
      };
      const matches = findMatches(testInput.rootNode, testSelector);

      //debugger;

      const result: NodeLocation[] = [
        [
          ["elements", 0],
          ["elements", 1],
        ],
        [["elements", 3]],
      ];
      expect(matches).toEqual(result);
    });

    it("Matching against a maxLength simple property Selector", () => {
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
                            value: "g",
                          },
                        },
                      ],
                      lastElement: [
                        {
                          name: "char",
                          language: "regex",
                          properties: {
                            value: "o",
                          },
                        },
                      ],
                    },
                  },
                  {
                    name: "char",
                    language: "regex",
                    properties: {
                      value: "123",
                    },
                  },
                ],
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "ab",
              },
            },
            {
              name: "char",
              language: "regex",
              properties: {
                value: "cd",
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "foo",
              },
            },
          ],
        },
      });

      const testSelector: Selector = {
        kind: "property-simple",
        name: "value",
        propertyValueMaxLength: 2,
      };
      const matches = findMatches(testInput.rootNode, testSelector);

      //debugger;

      const result: NodeLocation[] = [
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
        [["elements", 1]],
        [["elements", 2]],
      ];
      expect(matches).toEqual(result);
    });

    it("Matching against both a minLength and a maxLength simple property Selector", () => {
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
                            value: "g",
                          },
                        },
                      ],
                      lastElement: [
                        {
                          name: "char",
                          language: "regex",
                          properties: {
                            value: "o",
                          },
                        },
                      ],
                    },
                  },
                  {
                    name: "char",
                    language: "regex",
                    properties: {
                      value: "123",
                    },
                  },
                ],
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "ab",
              },
            },
            {
              name: "char",
              language: "regex",
              properties: {
                value: "cd",
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "foo",
              },
            },
          ],
        },
      });

      const testSelector: Selector = {
        kind: "property-simple",
        name: "value",
        propertyValueMinLength: 2,
        propertyValueMaxLength: 2,
      };
      const matches = findMatches(testInput.rootNode, testSelector);

      //debugger;

      const result: NodeLocation[] = [[["elements", 1]], [["elements", 2]]];
      expect(matches).toEqual(result);
    });

    it("Matching against a containsValue simple property Selector", () => {
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
                            value: "g",
                          },
                        },
                      ],
                      lastElement: [
                        {
                          name: "char",
                          language: "regex",
                          properties: {
                            value: "o",
                          },
                        },
                      ],
                    },
                  },
                  {
                    name: "char",
                    language: "regex",
                    properties: {
                      value: "123",
                    },
                  },
                ],
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "ab",
              },
            },
            {
              name: "char",
              language: "regex",
              properties: {
                value: "cd",
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "foo",
              },
            },
          ],
        },
      });

      const testSelector: Selector = {
        kind: "property-simple",
        name: "value",
        propertyContainsValue: "oo",
      };
      const matches = findMatches(testInput.rootNode, testSelector);

      //debugger;

      const result: NodeLocation[] = [[["elements", 3]]];
      expect(matches).toEqual(result);
    });

    it("Matching against a regex property Selector", () => {
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
                            value: "g",
                          },
                        },
                      ],
                      lastElement: [
                        {
                          name: "char",
                          language: "regex",
                          properties: {
                            value: "o",
                          },
                        },
                      ],
                    },
                  },
                  {
                    name: "char",
                    language: "regex",
                    properties: {
                      value: "123",
                    },
                  },
                ],
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "ab",
              },
            },
            {
              name: "char",
              language: "regex",
              properties: {
                value: "cd",
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "foo",
              },
            },
          ],
        },
      });

      const testSelector: Selector = {
        kind: "property-regex",
        name: "value",
        regexPattern: "(d|o)+",
      };
      const matches = findMatches(testInput.rootNode, testSelector);

      //debugger;

      const result: NodeLocation[] = [
        [
          ["elements", 0],
          ["elements", 0],
          ["lastElement", 0],
        ],
        [["elements", 2]],
        [["elements", 3]],
      ];
      expect(matches).toEqual(result);
    });
  });
});
