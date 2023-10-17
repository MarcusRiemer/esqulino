import * as AST from "./syntaxtree";
import {
  appendChildGroupsToNodeDescription,
  unwrapTransformation,
  applyRules,
  wrapTransformation,
  replaceTransformation,
  mergeTwoTransformation,
  splitOnPropertyTransformation,
} from "./transform";
import {
  TransformPattern,
  TransformPatternMergeTwo,
  TransformPatternSplitOnProperty,
  TransformRule,
} from "./transform.description";

fdescribe("Tests for the intermediate steps of the applyRules function", () => {
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

  describe("Tests for the unwrapTransformation function", () => {
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
      //debugger;
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

  describe("Tests for the wrapTransformation function", () => {
    it("wrap transformation on a root node", () => {
      const oldDesc: AST.NodeDescription = {
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
                      value: "5",
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
        name: "invis-container",
        language: "regex",
        children: {
          elements: [oldDesc],
        },
      };

      const wrapperNodeDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
      };

      const transformPattern: TransformPattern = {
        kind: "wrap",
        newNode: wrapperNodeDesc,
        appendOntoGroup: "elements",
      };

      let transformation: AST.NodeDescription = wrapTransformation(
        new AST.SyntaxTree(oldDesc).rootNode,
        [],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });

    // A set of elements is wrapped with a star quantifier
    it("wrap transformation on a non-root node", () => {
      const setDesc: AST.NodeDescription = {
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
                value: "f",
              },
            },
            {
              name: "char",
              language: "regex",
              properties: {
                value: "o",
              },
            },
          ],
        },
      };

      const oldDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            setDesc,
            {
              name: "string",
              language: "regex",
              properties: {
                value: "test",
              },
            },
          ],
        },
      };

      const res: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            {
              name: "builtInQuantifier",
              language: "regex",
              properties: {
                symbol: "*",
              },
              children: {
                elements: [setDesc],
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "test",
              },
            },
          ],
        },
      };

      const wrapperNodeDesc: AST.NodeDescription = {
        name: "builtInQuantifier",
        language: "regex",
        properties: {
          symbol: "*",
        },
        children: {
          elements: [],
        },
      };

      const transformPattern: TransformPattern = {
        kind: "wrap",
        newNode: wrapperNodeDesc,
        appendOntoGroup: "elements",
      };

      let transformation: AST.NodeDescription = wrapTransformation(
        new AST.SyntaxTree(oldDesc).rootNode,
        [["elements", 0]],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });
  });

  describe("Tests for the replaceTransformation function", () => {
    // The result should have the same childgroups as the old node, with the childgroups from the new Node description added to it.
    it("replace transformation on a root node with childgroups preserved, ignoring properties. The new Node has no children groups defined", () => {
      const childrenDesc = [
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
        {
          name: "string",
          language: "regex",
          properties: {
            value: "12345",
          },
        },
      ];

      const oldDesc: AST.NodeDescription = {
        name: "alternation",
        language: "regex",
        children: {
          alternatives: childrenDesc,
        },
      };

      const res: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          alternatives: childrenDesc,
        },
      };

      const replaceNodeDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
      };

      const transformPattern: TransformPattern = {
        kind: "replace",
        newNode: replaceNodeDesc,
        oldChildren: "copy",
        oldProperties: "ignore",
      };

      let transformation: AST.NodeDescription = replaceTransformation(
        new AST.SyntaxTree(oldDesc).rootNode,
        [],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });

    it("replace transformation on a root node with childgroups preserved, ignoring properties. The new Node has children groups defined, whose names are not shared with the old Node", () => {
      const childrenDesc1 = [
        {
          name: "string",
          language: "regex",
          properties: {
            value: "abc",
          },
        },
      ];

      const childrenDesc2 = [
        {
          name: "string",
          language: "regex",
          properties: {
            value: "def",
          },
        },
        {
          name: "string",
          language: "regex",
          properties: {
            value: "zzz",
          },
        },
      ];

      const childrenDesc3 = [
        {
          name: "string",
          language: "regex",
          properties: {
            value: "12345",
          },
        },
      ];

      const oldDesc: AST.NodeDescription = {
        name: "alternation",
        language: "regex",
        children: {
          alternatives1: childrenDesc1,
          alternatives2: childrenDesc2,
        },
      };

      const res: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: childrenDesc3,
          alternatives1: childrenDesc1,
          alternatives2: childrenDesc2,
        },
      };

      const replaceNodeDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: childrenDesc3,
        },
      };

      const transformPattern: TransformPattern = {
        kind: "replace",
        newNode: replaceNodeDesc,
        oldChildren: "copy",
        oldProperties: "ignore",
      };

      let transformation: AST.NodeDescription = replaceTransformation(
        new AST.SyntaxTree(oldDesc).rootNode,
        [],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });

    it("replace transformation on a root node with childgroups preserved, ignoring properties. The new Node has children groups defined, whose names are shared with the old Node", () => {
      const childrenDesc1 = [
        {
          name: "string",
          language: "regex",
          properties: {
            value: "abc",
          },
        },
      ];

      const childrenDesc2 = [
        {
          name: "string",
          language: "regex",
          properties: {
            value: "def",
          },
        },
        {
          name: "string",
          language: "regex",
          properties: {
            value: "zzz",
          },
        },
      ];

      const childrenDesc3 = [
        {
          name: "string",
          language: "regex",
          properties: {
            value: "12345",
          },
        },
      ];

      const oldDesc: AST.NodeDescription = {
        name: "alternation",
        language: "regex",
        children: {
          elements: childrenDesc1,
          alternatives: childrenDesc2,
        },
      };

      const mergedChildrenDesc = [];
      mergedChildrenDesc.push(...childrenDesc3, ...childrenDesc1);

      const res: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: mergedChildrenDesc,
          alternatives: childrenDesc2,
        },
      };

      const replaceNodeDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: childrenDesc3,
        },
      };

      const transformPattern: TransformPattern = {
        kind: "replace",
        newNode: replaceNodeDesc,
        oldChildren: "copy",
        oldProperties: "ignore",
      };

      let transformation: AST.NodeDescription = replaceTransformation(
        new AST.SyntaxTree(oldDesc).rootNode,
        [],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });

    // The result should have the same children as the old node, appended under the childgroup defined by the new Node description.
    it("replace transformation on a root node with a specified childgroup, ignoring properties. The old Node has only one childgroup defined. The new Node has no children groups defined.", () => {
      const childrenDesc = [
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
        {
          name: "string",
          language: "regex",
          properties: {
            value: "12345",
          },
        },
      ];

      const oldDesc: AST.NodeDescription = {
        name: "alternation",
        language: "regex",
        children: {
          alternatives: childrenDesc,
        },
      };

      const res: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: childrenDesc,
        },
      };

      const replaceNodeDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
      };

      const transformPattern: TransformPattern = {
        kind: "replace",
        newNode: replaceNodeDesc,
        oldChildren: "copy",
        oldProperties: "ignore",
        oldChildrenAppendOntoGroup: "elements",
      };

      let transformation: AST.NodeDescription = replaceTransformation(
        new AST.SyntaxTree(oldDesc).rootNode,
        [],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });

    it("replace transformation on a root node with a specified childgroup, ignoring properties. The old Node has three childgroups defined. The new Node has no children groups defined.", () => {
      const childrenDesc1 = [
        {
          name: "string",
          language: "regex",
          properties: {
            value: "abc",
          },
        },
      ];

      const childrenDesc2 = [
        {
          name: "string",
          language: "regex",
          properties: {
            value: "def",
          },
        },
        {
          name: "string",
          language: "regex",
          properties: {
            value: "zzz",
          },
        },
      ];

      const childrenDesc3 = [
        {
          name: "string",
          language: "regex",
          properties: {
            value: "12345",
          },
        },
      ];

      const mergedChildren = [];
      mergedChildren.push(...childrenDesc1, ...childrenDesc2, ...childrenDesc3);

      const oldDesc: AST.NodeDescription = {
        name: "alternation",
        language: "regex",
        children: {
          alternatives1: childrenDesc1,
          alternatives2: childrenDesc2,
          alternatives3: childrenDesc3,
        },
      };

      const res: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: mergedChildren,
        },
      };

      const replaceNodeDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
      };

      const transformPattern: TransformPattern = {
        kind: "replace",
        newNode: replaceNodeDesc,
        oldChildren: "copy",
        oldProperties: "ignore",
        oldChildrenAppendOntoGroup: "elements",
      };

      let transformation: AST.NodeDescription = replaceTransformation(
        new AST.SyntaxTree(oldDesc).rootNode,
        [],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });

    it("replace transformation on a root node with a specifed childgroup, ignoring properties. The new Node has children groups defined, whose names are shared with the old Node", () => {
      const childrenDesc1 = [
        {
          name: "string",
          language: "regex",
          properties: {
            value: "abc",
          },
        },
      ];

      const childrenDesc2 = [
        {
          name: "string",
          language: "regex",
          properties: {
            value: "def",
          },
        },
        {
          name: "string",
          language: "regex",
          properties: {
            value: "zzz",
          },
        },
      ];

      const childrenDesc3 = [
        {
          name: "string",
          language: "regex",
          properties: {
            value: "12345",
          },
        },
      ];

      const oldDesc: AST.NodeDescription = {
        name: "alternation",
        language: "regex",
        children: {
          elements: childrenDesc1,
          alternatives: childrenDesc2,
        },
      };

      const mergedChildrenDesc = [];
      mergedChildrenDesc.push(
        ...childrenDesc3,
        ...childrenDesc1,
        ...childrenDesc2
      );

      const res: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: mergedChildrenDesc,
        },
      };

      const replaceNodeDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: childrenDesc3,
        },
      };

      const transformPattern: TransformPattern = {
        kind: "replace",
        newNode: replaceNodeDesc,
        oldChildren: "copy",
        oldProperties: "ignore",
        oldChildrenAppendOntoGroup: "elements",
      };

      let transformation: AST.NodeDescription = replaceTransformation(
        new AST.SyntaxTree(oldDesc).rootNode,
        [],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });

    // TODO: Testing the same things as above but with preserving properties. Note that there are already test cases for handling properties in the unwrap Transformation.
  });

  describe("Tests for mergeTwoTransformation function", () => {
    it("Merge two quantifiers into one, ignoring all children. Properties are ignored.", () => {
      const leftNodeDesc = {
        name: "builtInQuantifier",
        language: "regex",
        properties: {
          symbol: "+",
        },
        children: {
          elements: [
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

      const rightNodeDesc = {
        name: "builtInQuantifier",
        language: "regex",
        properties: {
          symbol: "*",
        },
        children: {
          elements: [
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

      const parentDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [leftNodeDesc, rightNodeDesc],
        },
      };

      const res: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            {
              name: "builtInQuantifier",
              language: "regex",
            },
          ],
        },
      };

      const transformPattern: TransformPatternMergeTwo = {
        kind: "merge",
        oldChildren: "ignore",
        oldProperties: "ignore",
      };

      let transformation: AST.NodeDescription = mergeTwoTransformation(
        new AST.SyntaxTree(parentDesc).rootNode,
        [["elements", 0]],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });

    it("Merge two quantifiers into one, ignoring only right children. Properties are ignored.", () => {
      const leftNodeDesc: AST.NodeDescription = {
        name: "builtInQuantifier",
        language: "regex",
        properties: {
          symbol: "+",
        },
        children: {
          elements: [
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

      const rightNodeDesc: AST.NodeDescription = {
        name: "builtInQuantifier",
        language: "regex",
        properties: {
          symbol: "*",
        },
        children: {
          elements: [
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

      const parentDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [leftNodeDesc, rightNodeDesc],
        },
      };

      const res: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            {
              name: "builtInQuantifier",
              language: "regex",
              children: leftNodeDesc.children,
            },
          ],
        },
      };

      const transformPattern: TransformPatternMergeTwo = {
        kind: "merge",
        oldChildren: "copy-left",
        oldProperties: "ignore",
      };

      let transformation: AST.NodeDescription = mergeTwoTransformation(
        new AST.SyntaxTree(parentDesc).rootNode,
        [["elements", 0]],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });

    it("Merge two quantifiers into one, ignoring only left children. Properties are ignored.", () => {
      const leftNodeDesc: AST.NodeDescription = {
        name: "builtInQuantifier",
        language: "regex",
        properties: {
          symbol: "+",
        },
        children: {
          elements: [
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

      const rightNodeDesc: AST.NodeDescription = {
        name: "builtInQuantifier",
        language: "regex",
        properties: {
          symbol: "*",
        },
        children: {
          elements: [
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

      const parentDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [leftNodeDesc, rightNodeDesc],
        },
      };

      const res: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            {
              name: "builtInQuantifier",
              language: "regex",
              children: rightNodeDesc.children,
            },
          ],
        },
      };

      const transformPattern: TransformPatternMergeTwo = {
        kind: "merge",
        oldChildren: "copy-right",
        oldProperties: "ignore",
      };

      let transformation: AST.NodeDescription = mergeTwoTransformation(
        new AST.SyntaxTree(parentDesc).rootNode,
        [["elements", 0]],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });

    it("Merge two quantifiers into one, copying children from both nodes. Properties are ignored.", () => {
      const leftNodeDesc: AST.NodeDescription = {
        name: "builtInQuantifier",
        language: "regex",
        properties: {
          symbol: "+",
        },
        children: {
          elements: [
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

      const rightNodeDesc: AST.NodeDescription = {
        name: "builtInQuantifier",
        language: "regex",
        properties: {
          symbol: "*",
        },
        children: {
          elements: [
            {
              name: "char",
              language: "regex",
              properties: {
                value: "b",
              },
            },
          ],
        },
      };

      const parentDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [leftNodeDesc, rightNodeDesc],
        },
      };

      let mergedChildrenArray = [];
      mergedChildrenArray.push(
        ...leftNodeDesc.children["elements"],
        ...rightNodeDesc.children["elements"]
      );

      const res: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            {
              name: "builtInQuantifier",
              language: "regex",
              children: {
                elements: mergedChildrenArray,
              },
            },
          ],
        },
      };

      const transformPattern: TransformPatternMergeTwo = {
        kind: "merge",
        oldChildren: "copy-both",
        oldProperties: "ignore",
      };

      let transformation: AST.NodeDescription = mergeTwoTransformation(
        new AST.SyntaxTree(parentDesc).rootNode,
        [["elements", 0]],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });

    it("Merge two quantifiers into one, copying children from both nodes. Only left properties are copied.", () => {
      const leftNodeDesc: AST.NodeDescription = {
        name: "builtInQuantifier",
        language: "regex",
        properties: {
          symbol: "*",
        },
        children: {
          elements: [
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

      const rightNodeDesc: AST.NodeDescription = {
        name: "builtInQuantifier",
        language: "regex",
        properties: {
          symbol: "+",
        },
        children: {
          elements: [
            {
              name: "char",
              language: "regex",
              properties: {
                value: "b",
              },
            },
          ],
        },
      };

      const parentDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [leftNodeDesc, rightNodeDesc],
        },
      };

      let mergedChildrenArray = [];
      mergedChildrenArray.push(
        ...leftNodeDesc.children["elements"],
        ...rightNodeDesc.children["elements"]
      );

      const res: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            {
              name: "builtInQuantifier",
              language: "regex",
              children: {
                elements: mergedChildrenArray,
              },
              properties: {
                symbol: "*",
              },
            },
          ],
        },
      };

      const transformPattern: TransformPatternMergeTwo = {
        kind: "merge",
        oldChildren: "copy-both",
        oldProperties: "copy-left",
      };

      let transformation: AST.NodeDescription = mergeTwoTransformation(
        new AST.SyntaxTree(parentDesc).rootNode,
        [["elements", 0]],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });

    it("Merge two quantifiers into one, copying children from both nodes. Only right properties are copied.", () => {
      const leftNodeDesc: AST.NodeDescription = {
        name: "builtInQuantifier",
        language: "regex",
        properties: {
          symbol: "+",
        },
        children: {
          elements: [
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

      const rightNodeDesc: AST.NodeDescription = {
        name: "builtInQuantifier",
        language: "regex",
        properties: {
          symbol: "*",
        },
        children: {
          elements: [
            {
              name: "char",
              language: "regex",
              properties: {
                value: "b",
              },
            },
          ],
        },
      };

      const parentDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [leftNodeDesc, rightNodeDesc],
        },
      };

      let mergedChildrenArray = [];
      mergedChildrenArray.push(
        ...leftNodeDesc.children["elements"],
        ...rightNodeDesc.children["elements"]
      );

      const res: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            {
              name: "builtInQuantifier",
              language: "regex",
              children: {
                elements: mergedChildrenArray,
              },
            },
          ],
        },
      };

      const transformPattern: TransformPatternMergeTwo = {
        kind: "merge",
        oldChildren: "copy-both",
        oldProperties: "copy-right",
      };

      let transformation: AST.NodeDescription = mergeTwoTransformation(
        new AST.SyntaxTree(parentDesc).rootNode,
        [["elements", 0]],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });
  });

  describe("Tests for the splitOnPropertyTransformation function", () => {
    it("No changes when the specified property name does not exist on the selected node. A wrapper node is NOT defined. ", () => {
      const inpDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            {
              name: "char",
              language: "regex",
              properties: {
                value: "abcd",
              },
            },
          ],
        },
      };

      const res: AST.NodeDescription = inpDesc;

      const transformPattern: TransformPatternSplitOnProperty = {
        kind: "split-property",
        newNodes: "copy-type",
        propertyName: "test",
        oldChildren: "ignore",
        otherProperties: "ignore",
      };

      let transformation: AST.NodeDescription = splitOnPropertyTransformation(
        new AST.SyntaxTree(inpDesc).rootNode,
        [["elements", 0]],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });

    it("No changes when the specified property name does not exist on the selected node. A wrapper node is defined.", () => {
      const innerCharDesc: AST.NodeDescription = {
        name: "char",
        language: "regex",
        properties: {
          value: "abcd",
        },
      };

      const inpDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [innerCharDesc],
        },
      };

      const res: AST.NodeDescription = inpDesc;

      const transformPattern: TransformPatternSplitOnProperty = {
        kind: "split-property",
        newNodes: "copy-type",
        newNodesChildgroup: "splitted",
        wraperNode: { name: "wrapper", language: "regex" },
        propertyName: "test",
        oldChildren: "ignore",
        otherProperties: "ignore",
      };

      let transformation: AST.NodeDescription = splitOnPropertyTransformation(
        new AST.SyntaxTree(inpDesc).rootNode,
        [["elements", 0]],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });

    it("Splitting a char node on the 'value' property with one single value. A wrapper node is NOT defined.  transformPattern.newNodes = 'copy-type'", () => {
      const inpDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
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

      const res: AST.NodeDescription = inpDesc;

      const transformPattern: TransformPatternSplitOnProperty = {
        kind: "split-property",
        newNodes: "copy-type",
        propertyName: "value",
        oldChildren: "ignore",
        otherProperties: "ignore",
      };

      let transformation: AST.NodeDescription = splitOnPropertyTransformation(
        new AST.SyntaxTree(inpDesc).rootNode,
        [["elements", 0]],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });

    it("Splitting a char node on the 'value' property with one single value. A wrapper node is NOT defined.  transformPattern.newNodes has a user specified type", () => {
      const inpDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
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

      const newName = "string";
      const newLanguage = "regex-2";

      const res: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            {
              name: newName,
              language: newLanguage,
              properties: {
                value: "a",
              },
            },
          ],
        },
      };

      const transformPattern: TransformPatternSplitOnProperty = {
        kind: "split-property",
        newNodes: { name: newName, language: newLanguage },
        propertyName: "value",
        oldChildren: "ignore",
        otherProperties: "ignore",
      };

      let transformation: AST.NodeDescription = splitOnPropertyTransformation(
        new AST.SyntaxTree(inpDesc).rootNode,
        [["elements", 0]],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });

    it("Splitting a char node on the 'value' property with one multiple values. A wrapper node is NOT defined. transformPattern.newNodes = 'copy-type'", () => {
      const inpDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            {
              name: "char",
              language: "regex",
              properties: {
                value: "abcd",
              },
            },
          ],
        },
      };

      const res: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
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
            {
              name: "char",
              language: "regex",
              properties: {
                value: "d",
              },
            },
          ],
        },
      };

      const transformPattern: TransformPatternSplitOnProperty = {
        kind: "split-property",
        newNodes: "copy-type",
        propertyName: "value",
        oldChildren: "ignore",
        otherProperties: "ignore",
      };

      let transformation: AST.NodeDescription = splitOnPropertyTransformation(
        new AST.SyntaxTree(inpDesc).rootNode,
        [["elements", 0]],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });

    it("Splitting a char node on the 'value' property with one multiple values. A wrapper node is defined. transformPattern.newNodes = 'copy-type'", () => {
      const inpDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            {
              name: "char",
              language: "regex",
              properties: {
                value: "abcd",
              },
            },
          ],
        },
      };

      const wrapperNodeName = "wrapper-test";
      const wrapperNodeLanguage = "regex-2";
      const wrapperChildGroupName = "splitted";

      const res: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            {
              name: wrapperNodeName,
              language: wrapperNodeLanguage,
              children: {
                splitted: [
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
                  {
                    name: "char",
                    language: "regex",
                    properties: {
                      value: "d",
                    },
                  },
                ],
              },
            },
          ],
        },
      };

      const transformPattern: TransformPatternSplitOnProperty = {
        kind: "split-property",
        newNodes: "copy-type",
        propertyName: "value",
        oldChildren: "ignore",
        otherProperties: "ignore",
        wraperNode: { name: wrapperNodeName, language: wrapperNodeLanguage },
        newNodesChildgroup: wrapperChildGroupName,
      };

      let transformation: AST.NodeDescription = splitOnPropertyTransformation(
        new AST.SyntaxTree(inpDesc).rootNode,
        [["elements", 0]],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });

    it("Splitting a char node on the 'value' property with one multiple values. A wrapper node is defined. transformPattern.newNodes has a user specified type", () => {
      const inpDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            {
              name: "char",
              language: "regex",
              properties: {
                value: "abcd",
              },
            },
          ],
        },
      };

      const wrapperNodeName = "wrapper-test";
      const wrapperNodeLanguage = "regex-2";
      const wrapperChildGroupName = "splitted";

      const newNodename = "string";
      const newNodeLanguage = "regex-3";

      const res: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [
            {
              name: wrapperNodeName,
              language: wrapperNodeLanguage,
              children: {
                splitted: [
                  {
                    name: newNodename,
                    language: newNodeLanguage,
                    properties: {
                      value: "a",
                    },
                  },
                  {
                    name: newNodename,
                    language: newNodeLanguage,
                    properties: {
                      value: "b",
                    },
                  },
                  {
                    name: newNodename,
                    language: newNodeLanguage,
                    properties: {
                      value: "c",
                    },
                  },
                  {
                    name: newNodename,
                    language: newNodeLanguage,
                    properties: {
                      value: "d",
                    },
                  },
                ],
              },
            },
          ],
        },
      };

      const transformPattern: TransformPatternSplitOnProperty = {
        kind: "split-property",
        newNodes: { name: newNodename, language: newNodeLanguage },
        propertyName: "value",
        oldChildren: "ignore",
        otherProperties: "ignore",
        wraperNode: { name: wrapperNodeName, language: wrapperNodeLanguage },
        newNodesChildgroup: wrapperChildGroupName,
      };

      let transformation: AST.NodeDescription = splitOnPropertyTransformation(
        new AST.SyntaxTree(inpDesc).rootNode,
        [["elements", 0]],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });

    it("Splitting a string node on the 'value' property with a specified delimiter, deleting the delimiter. A wrapper node is NOT defined.  transformPattern.newNodes = 'copy-type'", () => {
      const inpDesc: AST.NodeDescription = {
        name: "alternation",
        language: "regex",
        children: {
          alternatives: [
            {
              name: "string",
              language: "regex",
              properties: {
                value: "ab|c|de|f",
              },
            },
          ],
        },
      };

      const res: AST.NodeDescription = {
        name: "alternation",
        language: "regex",
        children: {
          alternatives: [
            {
              name: "string",
              language: "regex",
              properties: {
                value: "ab",
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "c",
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "de",
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "f",
              },
            },
          ],
        },
      };

      const transformPattern: TransformPatternSplitOnProperty = {
        kind: "split-property",
        newNodes: "copy-type",
        propertyName: "value",
        delimiter: "|",
        //deleteDelimiter: true,
        oldChildren: "ignore",
        otherProperties: "ignore",
      };

      let transformation: AST.NodeDescription = splitOnPropertyTransformation(
        new AST.SyntaxTree(inpDesc).rootNode,
        [["alternatives", 0]],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });

    it("Splitting a string node on the 'value' property with a specified delimiter, keeping the delimiter. A wrapper node is NOT defined.  transformPattern.newNodes = 'copy-type'", () => {
      const inpDesc: AST.NodeDescription = {
        name: "alternation",
        language: "regex",
        children: {
          alternatives: [
            {
              name: "string",
              language: "regex",
              properties: {
                value: "ab|c|de|f",
              },
            },
          ],
        },
      };

      const res: AST.NodeDescription = {
        name: "alternation",
        language: "regex",
        children: {
          alternatives: [
            {
              name: "string",
              language: "regex",
              properties: {
                value: "ab|",
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "c|",
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "de|",
              },
            },
            {
              name: "string",
              language: "regex",
              properties: {
                value: "f",
              },
            },
          ],
        },
      };

      const transformPattern: TransformPatternSplitOnProperty = {
        kind: "split-property",
        newNodes: "copy-type",
        propertyName: "value",
        delimiter: "|",
        deleteDelimiter: false,
        oldChildren: "ignore",
        otherProperties: "ignore",
      };

      let transformation: AST.NodeDescription = splitOnPropertyTransformation(
        new AST.SyntaxTree(inpDesc).rootNode,
        [["alternatives", 0]],
        transformPattern
      );

      //debugger;
      expect(res).toEqual(transformation);
    });
  });
});
