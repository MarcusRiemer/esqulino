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

import { regexTranformRules } from "./transform.rules.regex";
const transformRules: TransformRule[] = [];
transformRules.push(regexTranformRules[0]);
//transformRules.push(regexTranformRules[1]);
transformRules.push(regexTranformRules[2]);
transformRules.push(regexTranformRules[3]);
//transformRules.push(regexTranformRules[4]);

fdescribe("Expected user input transformations", () => {
  describe("Multivalued character nodes are seperated into multiple single valued character nodes", () => {
    it('"abcd" should be split into " a | b | c | d "', () => {
      /**
       * Syntax tree for testing the splitting of a single character node into multiple ones if it
       * contains more then one character in its property value.
       */

      const inputDesc: AST.NodeDescription = {
        language: "regex",
        name: "char",
        properties: {
          value: "abcd",
        },
      };

      const expectedDesc: AST.NodeDescription = {
        language: "regex",
        name: "invis-container",
        children: {
          elements: [
            {
              language: "regex",
              name: "char",
              properties: {
                value: "a",
              },
            },
            {
              language: "regex",
              name: "char",
              properties: {
                value: "b",
              },
            },
            {
              language: "regex",
              name: "char",
              properties: {
                value: "c",
              },
            },
            {
              language: "regex",
              name: "char",
              properties: {
                value: "d",
              },
            },
          ],
        },
      };

      const inp = new AST.SyntaxTree(inputDesc);
      const resultDesc: AST.NodeDescription = applyRules(
        inp,
        transformRules
      ).toModel();

      debugger;
      expect(expectedDesc).toEqual(resultDesc);
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

      const expectedResultDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [starQuantifierDesc],
        },
      };

      const inp = new AST.SyntaxTree(inputDesc);
      const resultDesc: AST.NodeDescription = applyRules(
        inp,
        transformRules
      ).toModel();
      debugger;
      expect(expectedResultDesc).toEqual(resultDesc);
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

      const expectedResultDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [stringNodeDesc],
        },
      };

      const inp = new AST.SyntaxTree(inputDesc);
      const resultDesc: AST.NodeDescription = applyRules(
        inp,
        transformRules
      ).toModel();
      debugger;
      expect(expectedResultDesc).toEqual(resultDesc);
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

      const expectedResultDesc: AST.NodeDescription = {
        language: "regex",
        name: "invis-container",
        children: {
          elements: [alternationDesc],
        },
      };

      const inp = new AST.SyntaxTree(inputDesc);
      const resultDesc = applyRules(inp, transformRules).toModel();
      debugger;
      expect(expectedResultDesc).toEqual(resultDesc);
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

      const expectedResultDesc: AST.NodeDescription = {
        name: "invis-container",
        language: "regex",
        children: {
          elements: [innerContentDesc],
        },
      };

      const inp = new AST.SyntaxTree(inputDesc);
      const resultDesc = applyRules(inp, transformRules).toModel();
      debugger;
      expect(expectedResultDesc).toEqual(resultDesc);
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

      const expectedResultDesc: AST.NodeDescription = {
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
      const resultDesc = applyRules(inp, transformRules).toModel();
      debugger;
      expect(expectedResultDesc).toEqual(resultDesc);
    });
  });

  // TODO:

  describe("Autogrouping sequences of elements or multivalued strings within quantifiers", () => {});

  // TODO:

  describe("Autogrouping sequences of elements or multivalued strings within alternation", () => {});

  // TODO:

  describe("Automerging of nested alternation", () => {
    it("Unwrapping a nested Alternation, with the alternatives copied onto the parent", () => {
      const innerAlternationDesc  : AST.NodeDescription= {
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

      const inputDesc : AST.NodeDescription = {
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

      const expectedResultDesc : AST.NodeDescription = {
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
      const resultDesc = applyRules(inp, transformRules).toModel();
      debugger;
      expect(expectedResultDesc).toEqual(resultDesc);
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

      const expectedResultDesc : AST.NodeDescription = {
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
      const resultDesc = applyRules(inp, transformRules).toModel();
      debugger;
      expect(expectedResultDesc).toEqual(resultDesc);
    });

  });

  // TODO: Groups remove the need for invis-containers within them in certain cases. Should I account for that?

  describe("Autounwrapping of invis-containers withing a group node", () => {});
});

