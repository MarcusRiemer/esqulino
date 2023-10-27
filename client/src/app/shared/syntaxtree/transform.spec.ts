import * as AST from "./syntaxtree";
import {
  appendChildGroupsToNodeDescription,
  unwrapTransformation,
  replaceTemplates,
} from "./transform";
import { TransformPattern } from "./transform.description";

const templates: string[] = []; // Just a placeholder for now

describe("Tests for the intermediate steps of the replaceTemplates function", () => {
  it("Append given children to an NodeDescription with undefined children", () => {
    const noChildrenNodeDesc: AST.NodeDescription = {
      name: "char",
      language: "regex",
      properties: {
        value: "abcd",
      },
    };

    const nodeDescWithChildren: AST.NodeDescription = {
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
                    value: "4",
                  },
                },
              ],
            },
          },
          {
            name: "char",
            language: "regex",
            properties: {
              value: "a",
            },
          },
        ],
      },
    };

    const res: AST.NodeDescription = {
      name: "char",
      language: "regex",
      properties: {
        value: "abcd",
      },
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
                    value: "4",
                  },
                },
              ],
            },
          },
          {
            name: "char",
            language: "regex",
            properties: {
              value: "a",
            },
          },
        ],
      },
    };
    const transformation: AST.NodeDescription =
      appendChildGroupsToNodeDescription(
        noChildrenNodeDesc,
        nodeDescWithChildren.children,
        "start",
        0
      );
    //debugger;
    expect(res).toEqual(transformation);
  });

  it("Append given children to an NodeDescription with 0 children", () => {
    const noChildrenNodeDesc: AST.NodeDescription = {
      name: "char",
      language: "regex",
      properties: {
        value: "abcd",
      },
      children: {},
    };

    const nodeDescWithChildren: AST.NodeDescription = {
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
                    value: "4",
                  },
                },
              ],
            },
          },
          {
            name: "char",
            language: "regex",
            properties: {
              value: "a",
            },
          },
        ],
      },
    };

    const res: AST.NodeDescription = {
      name: "char",
      language: "regex",
      properties: {
        value: "abcd",
      },
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
                    value: "4",
                  },
                },
              ],
            },
          },
          {
            name: "char",
            language: "regex",
            properties: {
              value: "a",
            },
          },
        ],
      },
    };
    const transformation: AST.NodeDescription =
      appendChildGroupsToNodeDescription(
        noChildrenNodeDesc,
        nodeDescWithChildren.children,
        "start",
        0
      );
    //debugger;
    expect(res).toEqual(transformation);
  });

  it("unwrap transformation on a parent with no other children", () => {
    const childrenDesc = {
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
                        value: "3",
                      },
                    },
                  ],
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
      ],
    };

    const innerInvisContainer: AST.NodeDescription = {
      name: "invis-container",
      language: "regex",
      children: childrenDesc,
    };

    const parentNodeDesc: AST.NodeDescription = {
      name: "invis-container",
      language: "regex",
      children: {
        elements: [innerInvisContainer],
      },
    };

    const res: AST.NodeDescription = {
      name: "invis-container",
      language: "regex",
      children: childrenDesc,
    };

    const transformPattern: TransformPattern = {
      kind: "unwrap",
      position: "start",
      oldProperties: "copy",
    };

    const transformation: AST.NodeDescription = unwrapTransformation(
      new AST.SyntaxTree(parentNodeDesc).rootNode,
      [["elements", 0]],
      transformPattern
    );
    //debugger;
    expect(res).toEqual(transformation);
  });

  // The result should have the children from the unwrapped node appended to the
  // parent node at the end on childgroups that already exist on the parent node
  // as well as adding new childgroups for the case where the parent node does not
  // already have the existing childgroup.
  it("unwrap transformation on a parent with existing children", () => {
    const nodeToBeUnwrappedDesc: AST.NodeDescription = {
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
              value: "child",
            },
          },
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
                    value: "",
                  },
                },
              ],
            },
          },
        ],
        testChildGroup: [
          {
            name: "char",
            language: "regex",
            properties: {
              value: "1",
            },
          },
          {
            name: "char",
            language: "regex",
            properties: {
              value: "2",
            },
          },
        ],
      },
    };

    const inp: AST.NodeDescription = {
      name: "set",
      language: "regex",
      children: {
        setNegation: [],
        elements: [
          {
            name: "string",
            language: "regex",
            properties: {
              value: "parent",
            },
          },
          nodeToBeUnwrappedDesc,
        ],
      },
    };

    const res: AST.NodeDescription = {
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
            name: "string",
            language: "regex",
            properties: {
              value: "parent",
            },
          },
          {
            name: "char",
            language: "regex",
            properties: {
              value: "child",
            },
          },
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
                    value: "",
                  },
                },
              ],
            },
          },
        ],
        testChildGroup: [
          {
            name: "char",
            language: "regex",
            properties: {
              value: "1",
            },
          },
          {
            name: "char",
            language: "regex",
            properties: {
              value: "2",
            },
          },
        ],
      },
    };

    const transformPattern: TransformPattern = {
      kind: "unwrap",
      position: "end",
      oldProperties: "ignore",
    };

    const transformation: AST.NodeDescription = unwrapTransformation(
      new AST.SyntaxTree(inp).rootNode,
      [["elements", 1]],
      transformPattern
    );
    // //debugger;
    expect(res).toEqual(transformation);
  });

  it("unwrap transformation on a parent with no properties", () => {
    const childrenDesc = {
      elements: [
        {
          name: "string",
          language: "regex",
          properties: {
            value: "foo",
          },
        },
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
                        value: "a",
                      },
                    },
                  ],
                  lastElement: [
                    {
                      name: "char",
                      language: "regex",
                      properties: {
                        value: "z",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    };

    const nodeToBeUnwrappedDesc: AST.NodeDescription = {
      name: "builtInQuantifier",
      language: "regex",
      properties: {
        symbol: "+",
      },
      children: childrenDesc,
    };

    const parentNodeDesc: AST.NodeDescription = {
      name: "invis-container",
      language: "regex",
      children: {
        elements: [nodeToBeUnwrappedDesc],
      },
    };

    const res: AST.NodeDescription = {
      name: "invis-container",
      language: "regex",
      children: childrenDesc,
      properties: {
        symbol: "+",
      },
    };

    const transformPattern: TransformPattern = {
      kind: "unwrap",
      position: "start",
      oldProperties: "copy",
    };

    const transformation: AST.NodeDescription = unwrapTransformation(
      new AST.SyntaxTree(parentNodeDesc).rootNode,
      [["elements", 0]],
      transformPattern
    );
    //debugger;
    expect(res).toEqual(transformation);
  });

  // The result should have the properties from the unwrapped node appended to the
  // properties of the parent node that already exist on the parent node
  // as well as adding new properties for the case where the parent node does not
  // already have the property in question.
  it("unwrap transformation on a parent with existing properties with copy", () => {
    const childrenDesc = {
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
                        value: "3",
                      },
                    },
                  ],
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
      ],
    };

    const parentNodeDesc: AST.NodeDescription = {
      name: "string",
      language: "regex",
      properties: {
        value: "",
      },
      children: {
        testingChildren: [
          {
            name: "char",
            language: "regex",
            properties: {
              value: "a",
            },
          },
          {
            name: "char",
            language: "regex",
            properties: {
              value: "b",
            },
          },
          {
            name: "char",
            language: "regex",
            properties: {
              value: "c",
            },
          },
        ],
      },
    };

    const res: AST.NodeDescription = {
      name: "string",
      language: "regex",
      properties: {
        value: "abc",
      },
      children: {
        testingChildren: [],
      },
    };

    const transformPattern: TransformPattern = {
      kind: "unwrap",
      position: "end",
      oldProperties: "copy",
    };

    let transformation: AST.NodeDescription = unwrapTransformation(
      new AST.SyntaxTree(parentNodeDesc).rootNode,
      [["testingChildren", 0]],
      transformPattern
    );
    transformation = unwrapTransformation(
      new AST.SyntaxTree(transformation).rootNode,
      [["testingChildren", 0]],
      transformPattern
    );
    transformation = unwrapTransformation(
      new AST.SyntaxTree(transformation).rootNode,
      [["testingChildren", 0]],
      transformPattern
    );
    //debugger;
    expect(res).toEqual(transformation);
  });

  it("unwrap transformation on a parent with existing properties with overwrite", () => {
    const childrenDesc = {
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
                        value: "3",
                      },
                    },
                  ],
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
      ],
    };

    const parentNodeDesc: AST.NodeDescription = {
      name: "string",
      language: "regex",
      properties: {
        value: "",
      },
      children: {
        testingChildren: [
          {
            name: "char",
            language: "regex",
            properties: {
              value: "a",
            },
          },
          {
            name: "char",
            language: "regex",
            properties: {
              value: "b",
            },
          },
          {
            name: "char",
            language: "regex",
            properties: {
              value: "c",
            },
          },
        ],
      },
    };

    const res: AST.NodeDescription = {
      name: "string",
      language: "regex",
      properties: {
        value: "c",
      },
      children: {
        testingChildren: [],
      },
    };

    const transformPattern: TransformPattern = {
      kind: "unwrap",
      position: "end",
      oldProperties: "overwrite",
    };

    let transformation: AST.NodeDescription = unwrapTransformation(
      new AST.SyntaxTree(parentNodeDesc).rootNode,
      [["testingChildren", 0]],
      transformPattern
    );
    transformation = unwrapTransformation(
      new AST.SyntaxTree(transformation).rootNode,
      [["testingChildren", 0]],
      transformPattern
    );
    transformation = unwrapTransformation(
      new AST.SyntaxTree(transformation).rootNode,
      [["testingChildren", 0]],
      transformPattern
    );
    //debugger;
    expect(res).toEqual(transformation);
  });
});

describe("Expected user input transformations", () => {
  describe("Multivalued character nodes are seperated into multiple single valued character nodes", () => {
    it('"abcd" should be split into " a | b | c | d "', () => {
      /**
       * Syntax tree for testing the splitting of a single character node into multiple ones if it
       * contains more then one character in its property value.
       */

      const inputDesc: AST.NodeDescription = {
        language: "regex-test",
        name: "char",
        properties: {
          value: "abcd",
        },
      };

      const resultDesc: AST.NodeDescription = {
        language: "regex-test",
        name: "invis-container",
        children: {
          nodes: [
            {
              language: "regex-test",
              name: "char",
              properties: {
                value: "a",
              },
            },
            {
              language: "regex-test",
              name: "char",
              properties: {
                value: "b",
              },
            },
            {
              language: "regex-test",
              name: "char",
              properties: {
                value: "c",
              },
            },
            {
              language: "regex-test",
              name: "char",
              properties: {
                value: "d",
              },
            },
          ],
        },
      };

      const inp = new AST.SyntaxTree(inputDesc);
      const res = new AST.SyntaxTree(resultDesc);
      expect(res).toEqual(replaceTemplates(inp, templates));
    });
  });

  describe("Root quantifier nodes should be wrapped with an invis-container node", () => {
    it("Autowrapping of a root star quantifier", () => {
      // Cases for Quantifiers
      // * | + | ?

      const starQuantifierDesc: AST.NodeDescription = {
        name: "builtInQuantifier",
        language: "regex",
        properties: {
          symbol: "*",
        },
        children: {
          element: [
            {
              name: "string",
              language: "regex",
              properties: {
                value: "abc",
              },
            },
          ],
        },
      };

      const inputDesc: AST.NodeDescription = starQuantifierDesc;

      const resultDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [starQuantifierDesc],
        },
      };

      const inp = new AST.SyntaxTree(inputDesc);
      const res = new AST.SyntaxTree(resultDesc);
      expect(res).toEqual(replaceTemplates(inp, templates));
    });
  });

  describe("Root element pattern nodes should be autowrapped with an invis-container node", () => {
    // Cases for ElemPatterns
    // String
    // Char
    // Set
    // Group
    // Shorthand
    // Meta-chars

    it("Autowrapping of root string node", () => {
      const stringNodeDesc: AST.NodeDescription = {
        name: "string",
        language: "regex",
        properties: {
          value: "12345",
        },
      };

      const inputDesc: AST.NodeDescription = stringNodeDesc;

      const resultDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [stringNodeDesc],
        },
      };

      const inp = new AST.SyntaxTree(inputDesc);
      const res = new AST.SyntaxTree(resultDesc);
      expect(res).toEqual(replaceTemplates(inp, templates));
    });
  });

  describe("Root alternation nodes should be be autowrapped with an invis-container node", () => {
    it("Autowrapping of single root alternation pattern nodes with an invis-container node", () => {
      const alternationDesc: AST.NodeDescription = {
        name: "alternation",
        language: "regex",
        children: {
          alternatives: [
            {
              name: "char",
              language: "regex",
              properties: {
                value: "a",
              },
            },
            {
              name: "char",
              language: "regex",
              properties: {
                value: "b",
              },
            },
            {
              name: "char",
              language: "regex",
              properties: {
                value: "c",
              },
            },
          ],
        },
      };

      const inputDesc: AST.NodeDescription = alternationDesc;

      const resultDesc: AST.NodeDescription = {
        language: "regex",
        name: "invis-node",
        children: {
          nodes: [alternationDesc],
        },
      };

      const inp = new AST.SyntaxTree(inputDesc);
      const res = new AST.SyntaxTree(resultDesc);
      expect(res).toEqual(replaceTemplates(inp, templates));
    });
  });

  describe("Removal of undesirable invis-container nodes", () => {
    it("Removal of nested invis-container nodes", () => {
      const innerContentDesc = {
        name: "group",
        language: "regex",
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
      };

      const inputDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            {
              name: "invis-container",
              language: "regex",
              children: {
                elements: [innerContentDesc],
              },
            },
          ],
        },
      };

      const resultDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [innerContentDesc],
        },
      };

      const inp = new AST.SyntaxTree(inputDesc);
      const res = new AST.SyntaxTree(resultDesc);
      expect(res).toEqual(replaceTemplates(inp, templates));
    });

    it("Merging of two sibling invis-container nodes into one invis-container node that contains all their children", () => {
      const childOneDesc = {
        name: "string",
        language: "regex",
        properties: {
          value: "hello ",
        },
      };

      const childTwoDesc = {
        name: "string",
        language: "regex",
        properties: {
          value: "world",
        },
      };

      const inputDesc: AST.NodeDescription = {
        name: "group",
        language: "regex",
        children: {
          elements: [
            {
              name: "invis-container",
              language: "regex",
              children: {
                elements: [childOneDesc],
              },
            },
            {
              name: "invis-container",
              language: "regex",
              children: {
                elements: [childTwoDesc],
              },
            },
          ],
        },
      };

      const resultDesc: AST.NodeDescription = {
        name: "group",
        language: "regex",
        children: {
          elements: [
            {
              name: "invis-container",
              language: "regex",
              children: {
                elements: [childOneDesc, childTwoDesc],
              },
            },
          ],
        },
      };

      const inp = new AST.SyntaxTree(inputDesc);
      const res = new AST.SyntaxTree(resultDesc);
      expect(res).toEqual(replaceTemplates(inp, templates));
    });
  });

  // TODO:

  describe("Autogrouping sequences of elements or multivalued strings within quantifiers", () => {});

  // TODO:

  describe("Autogrouping sequences of elements or multivalued strings within alternation", () => {});

  // TODO:

  describe("Automerging of nested alternation", () => {
    it("Unwrapping a nested Alternation, with the alternatives copied onto the parent", () => {
      const innerAlternationDesc = {
        name: "alternation",
        language: "regex",
        children: {
          alternatives: [
            {
              name: "char",
              language: "regex",
              properties: {
                value: "1",
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "2",
              },
            },
          ],
        },
      };

      const inputDesc = {
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
              name: "group",
              language: "regex",
              children: {
                elements: [innerAlternationDesc],
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "def",
              },
            },
          ],
        },
      };

      const resultDesc = {
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
                value: "1",
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "2",
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "def",
              },
            },
          ],
        },
      };

      const inp = new AST.SyntaxTree(inputDesc);
      const res = new AST.SyntaxTree(resultDesc);
      expect(res).toEqual(replaceTemplates(inp, templates));
    });
  });

  describe("Autosplitting alternation elements that contains the '|' separator character", () => {
    it("Autosplitting a string on the '|' separator", () => {
      const inputDesc = {
        name: "alternation",
        language: "regex",
        children: {
          alternatives: [
            {
              name: "string",
              language: "regex",
              properties: {
                value: "abc|def",
              },
            },
          ],
        },
      };

      const resultDesc = {
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
              name: "string",
              language: "regex",
              properties: {
                value: "def",
              },
            },
          ],
        },
      };

      const inp = new AST.SyntaxTree(inputDesc);
      const res = new AST.SyntaxTree(resultDesc);
      expect(res).toEqual(replaceTemplates(inp, templates));
    });

    it("Autosplitting a childGroup of chars on the '|' separator", () => {
      const separatorChar = {
        name: "char",
        language: "regex",
        properties: {
          value: "|",
        },
      };

      const inputDesc = {
        name: "alternation",
        language: "regex",
        children: {
          alternatives: [
            {
              name: "char",
              language: "regex",
              properties: {
                value: "a",
              },
            },
            separatorChar,
            {
              name: "char",
              language: "regex",
              properties: {
                value: "b",
              },
            },
            separatorChar,
            {
              name: "char",
              language: "regex",
              properties: {
                value: "c",
              },
            },
          ],
        },
      };

      const resultDesc = {
        name: "alternation",
        language: "regex",
        children: {
          alternatives: [
            {
              name: "char",
              language: "regex",
              properties: {
                value: "a",
              },
            },
            {
              name: "char",
              language: "regex",
              properties: {
                value: "b",
              },
            },
            {
              name: "char",
              language: "regex",
              properties: {
                value: "c",
              },
            },
          ],
        },
      };

      const inp = new AST.SyntaxTree(inputDesc);
      const res = new AST.SyntaxTree(resultDesc);
      expect(res).toEqual(replaceTemplates(inp, templates));
    });
  });

  // TODO: Groups remove the need for invis-containers within them in certain cases. Should I account for that?

  describe("Autounwrapping of invis-containers withing a group node", () => {});
});
