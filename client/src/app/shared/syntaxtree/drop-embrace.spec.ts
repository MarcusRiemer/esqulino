import { Node, NodeDescription, Tree } from "./syntaxtree";
import { Validator } from "./validator";
import {
  embraceNode,
  _findPossibleLocations,
  _findMatchInCandidate,
  _localEmbrace,
  canEmbraceNode,
  embraceMatches,
} from "./drop-embrace";
import { QualifiedTypeName } from "./syntaxtree.description";
import { GRAMMAR_BOOLEAN_DESCRIPTION } from "./grammar.spec.boolean";

describe("Drop Embrace", () => {
  // ######################################################################

  describe("_findPossibleLocations", () => {
    it("false with constant => []", () => {
      const parentDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          value: "false",
        },
      };
      const fillType: QualifiedTypeName = {
        languageName: "expr",
        typeName: "constant",
      };
      const v = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);

      const res = _findPossibleLocations(
        new Node(parentDesc, undefined),
        fillType,
        v
      );
      expect(res).toEqual([]);
    });

    it("not(<hole>) with constant => [[expr, 0]]", () => {
      const parentDesc: NodeDescription = {
        language: "expr",
        name: "negate",
        children: {
          expr: [],
        },
      };
      const fillType: QualifiedTypeName = {
        languageName: "expr",
        typeName: "booleanConstant",
      };
      const v = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);

      const res = _findPossibleLocations(
        new Node(parentDesc, undefined),
        fillType,
        v
      );
      expect(res).toEqual([[["expr", 0]]]);
    });

    it("binary(<hole>, <hole>) with constant", () => {
      const parentDesc: NodeDescription = {
        language: "expr",
        name: "booleanBinary",
        children: {
          lhs: [],
          rhs: [],
        },
      };
      const fillType: QualifiedTypeName = {
        languageName: "expr",
        typeName: "booleanConstant",
      };
      const v = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);

      const res = _findPossibleLocations(
        new Node(parentDesc, undefined),
        fillType,
        v
      );
      expect(res).toEqual([[["lhs", 0]], [["rhs", 0]]]);
    });

    it("binary(false, <hole>) with constant", () => {
      const parentDesc: NodeDescription = {
        language: "expr",
        name: "booleanBinary",
        children: {
          lhs: [
            {
              language: "expr",
              name: "booleanConstant",
              properties: {
                value: "false",
              },
            },
          ],
          rhs: [],
        },
      };
      const fillType: QualifiedTypeName = {
        languageName: "expr",
        typeName: "booleanConstant",
      };
      const v = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);

      const res = _findPossibleLocations(
        new Node(parentDesc, undefined),
        fillType,
        v
      );
      expect(res).toEqual([[["rhs", 0]]]);
    });

    it("binary(<hole>, false) with constant", () => {
      const parentDesc: NodeDescription = {
        language: "expr",
        name: "booleanBinary",
        children: {
          lhs: [],
          rhs: [
            {
              language: "expr",
              name: "booleanConstant",
              properties: {
                value: "false",
              },
            },
          ],
        },
      };
      const fillType: QualifiedTypeName = {
        languageName: "expr",
        typeName: "booleanConstant",
      };
      const v = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);

      const res = _findPossibleLocations(
        new Node(parentDesc, undefined),
        fillType,
        v
      );
      expect(res).toEqual([[["lhs", 0]]]);
    });

    it("binary(true, false) with constant", () => {
      const parentDesc: NodeDescription = {
        language: "expr",
        name: "booleanBinary",
        children: {
          lhs: [
            {
              language: "expr",
              name: "booleanConstant",
              properties: {
                value: "true",
              },
            },
          ],
          rhs: [
            {
              language: "expr",
              name: "booleanConstant",
              properties: {
                value: "false",
              },
            },
          ],
        },
      };
      const fillType: QualifiedTypeName = {
        languageName: "expr",
        typeName: "booleanConstant",
      };
      const v = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);

      const res = _findPossibleLocations(
        new Node(parentDesc, undefined),
        fillType,
        v
      );
      expect(res).toEqual([]);
    });
  });

  // ######################################################################

  describe("_localEmbrace", () => {
    it("false into not(<here>)", () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          value: "false",
        },
      };

      const embracingDescription: NodeDescription = {
        language: "expr",
        name: "negate",
        children: {
          expr: [],
        },
      };

      const embracedNode = new Tree(inTreeDesc).rootNode;

      const res = _localEmbrace(embracedNode, embracingDescription, [
        ["expr", 0],
      ]);

      const expDescription: NodeDescription = {
        language: "expr",
        name: "negate",
        children: {
          expr: [inTreeDesc],
        },
      };

      expect(res).toEqual(expDescription);
    });
  });

  // ######################################################################

  describe("_findMatch", () => {
    it("false against [not(<hole>)]", () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          value: "false",
        },
      };

      const embraceCandidates: NodeDescription[] = [
        {
          language: "expr",
          name: "negate",
          children: {
            expr: [],
          },
        },
      ];

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);

      const targetNode = new Tree(inTreeDesc).rootNode;
      const res = _findMatchInCandidate(
        validator,
        targetNode,
        embraceCandidates
      );

      expect(res).toEqual([embraceCandidates[0], [["expr", 0]]]);
    });

    it("false against [not(true)]", () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          value: "false",
        },
      };

      const embraceCandidates: NodeDescription[] = [
        {
          language: "expr",
          name: "negate",
          children: {
            expr: [
              {
                language: "expr",
                name: "booleanConstant",
                properties: {
                  value: "true",
                },
              },
            ],
          },
        },
      ];

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);

      const targetNode = new Tree(inTreeDesc).rootNode;
      const res = _findMatchInCandidate(
        validator,
        targetNode,
        embraceCandidates
      );

      expect(res).toBeUndefined();
    });
  });
  // ######################################################################

  describe(`embraceNode(), canEmbraceNode and embraceMatches()`, () => {
    it("<emptyTree> => not(<hole>)", () => {
      const embraceCandidates: NodeDescription[] = [
        {
          language: "expr",
          name: "negate",
          children: {
            expr: [],
          },
        },
      ];

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);

      const prev = new Tree(undefined);
      const curr = embraceNode(validator, prev, [], embraceCandidates);

      const expTreeDesc: NodeDescription = {
        language: "expr",
        name: "negate",
        children: {
          expr: [],
        },
      };
      expect(curr.toModel()).toEqual(expTreeDesc);
      expect(canEmbraceNode(validator, prev, [], embraceCandidates)).toBe(
        false
      );
      expect(embraceMatches(validator, prev, [], embraceCandidates)).toEqual(
        []
      );
    });

    it("false => not(<false>)", () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          value: "false",
        },
      };

      const embraceCandidates: NodeDescription[] = [
        {
          language: "expr",
          name: "negate",
          children: {
            expr: [],
          },
        },
      ];

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);

      const prev = new Tree(inTreeDesc);
      const curr = embraceNode(validator, prev, [], embraceCandidates);

      const expTreeDesc: NodeDescription = {
        language: "expr",
        name: "negate",
        children: {
          expr: [inTreeDesc],
        },
      };
      expect(curr.toModel()).toEqual(expTreeDesc);
      expect(canEmbraceNode(validator, prev, [], embraceCandidates)).toBe(true);
      expect(embraceMatches(validator, prev, [], embraceCandidates)).toEqual([
        {
          location: [],
          algorithm: "allowEmbrace",
          nodeDescription: embraceCandidates[0],
          operation: "embrace",
          candidateHole: [["expr", 0]],
        },
      ]);
    });

    it("not(false) => not(<not(false)>)", () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "negate",
        children: {
          expr: [
            {
              language: "expr",
              name: "booleanConstant",
              properties: {
                value: "false",
              },
            },
          ],
        },
      };

      const embraceCandidates: NodeDescription[] = [
        {
          language: "expr",
          name: "negate",
          children: {
            expr: [],
          },
        },
      ];

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);

      const prev = new Tree(inTreeDesc);
      const curr = embraceNode(validator, prev, [], embraceCandidates);

      const expTreeDesc: NodeDescription = {
        language: "expr",
        name: "negate",
        children: {
          expr: [inTreeDesc],
        },
      };
      expect(curr.toModel()).toEqual(expTreeDesc);
      expect(canEmbraceNode(validator, prev, [], embraceCandidates)).toBe(true);
    });

    it("false => binary(<false>, <hole>)", () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          value: "false",
        },
      };

      const embraceCandidates: NodeDescription[] = [
        {
          language: "expr",
          name: "booleanBinary",
          children: {
            lhs: [],
            rhs: [],
          },
        },
      ];

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);

      const prev = new Tree(inTreeDesc);
      const curr = embraceNode(validator, prev, [], embraceCandidates);

      const expTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanBinary",
        children: {
          lhs: [inTreeDesc],
          rhs: [],
        },
      };
      expect(curr.toModel()).toEqual(expTreeDesc);
      expect(canEmbraceNode(validator, prev, [], embraceCandidates)).toBe(true);
    });

    it("false => binary(true, <false>)", () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          value: "false",
        },
      };

      const embraceCandidates: NodeDescription[] = [
        {
          language: "expr",
          name: "booleanBinary",
          children: {
            lhs: [
              {
                language: "expr",
                name: "booleanConstant",
                properties: {
                  value: "true",
                },
              },
            ],
            rhs: [],
          },
        },
      ];

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);

      const prev = new Tree(inTreeDesc);
      const curr = embraceNode(validator, prev, [], embraceCandidates);

      const expTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanBinary",
        children: {
          lhs: [embraceCandidates[0].children["lhs"][0]],
          rhs: [inTreeDesc],
        },
      };
      expect(curr.toModel()).toEqual(expTreeDesc);
      expect(canEmbraceNode(validator, prev, [], embraceCandidates)).toBe(true);
    });

    it("binary(true, <hole>) => not(<binary(true, <hole>)>)", () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanBinary",
        children: {
          lhs: [
            {
              language: "expr",
              name: "booleanConstant",
              properties: {
                value: "true",
              },
            },
          ],
          rhs: [],
        },
      };

      const embraceCandidates: NodeDescription[] = [
        {
          language: "expr",
          name: "negate",
          children: {
            expr: [],
          },
        },
      ];

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);

      const prev = new Tree(inTreeDesc);
      const curr = embraceNode(validator, prev, [], embraceCandidates);

      const expTreeDesc: NodeDescription = {
        language: "expr",
        name: "negate",
        children: {
          expr: [inTreeDesc],
        },
      };
      expect(curr.toModel()).toEqual(expTreeDesc);
      expect(canEmbraceNode(validator, prev, [], embraceCandidates)).toBe(true);
    });

    it(`true => true (candidates don't match)`, () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          value: "false",
        },
      };

      const embraceCandidates: NodeDescription[] = [
        {
          language: "expr",
          name: "noMatch",
        },
      ];

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);

      const prev = new Tree(inTreeDesc);
      const curr = embraceNode(validator, prev, [], embraceCandidates);

      expect(curr.toModel()).toEqual(inTreeDesc);
      expect(canEmbraceNode(validator, prev, [], embraceCandidates)).toBe(
        false
      );
    });

    it(`true => not(<true>) (second candidate matches)`, () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          value: "false",
        },
      };

      const embraceCandidates: NodeDescription[] = [
        {
          language: "expr",
          name: "noMatch",
        },
        {
          language: "expr",
          name: "negate",
          children: {
            expr: [],
          },
        },
      ];

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);

      const prev = new Tree(inTreeDesc);
      const curr = embraceNode(validator, prev, [], embraceCandidates);

      const expTreeDesc: NodeDescription = {
        language: "expr",
        name: "negate",
        children: {
          expr: [inTreeDesc],
        },
      };
      expect(curr.toModel()).toEqual(expTreeDesc);
      expect(canEmbraceNode(validator, prev, [], embraceCandidates)).toBe(true);
    });

    it(`true => (<true>) (first candidate takes precedence)`, () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          value: "false",
        },
      };

      const embraceCandidates: NodeDescription[] = [
        {
          language: "expr",
          name: "parentheses",
          children: {
            expr: [],
          },
        },
        {
          language: "expr",
          name: "negate",
          children: {
            expr: [],
          },
        },
      ];

      const validator = new Validator([GRAMMAR_BOOLEAN_DESCRIPTION]);

      const prev = new Tree(inTreeDesc);
      const curr = embraceNode(validator, prev, [], embraceCandidates);

      const expTreeDesc: NodeDescription = {
        language: "expr",
        name: "parentheses",
        children: {
          expr: [inTreeDesc],
        },
      };
      expect(curr.toModel()).toEqual(expTreeDesc);
      expect(canEmbraceNode(validator, prev, [], embraceCandidates)).toBe(true);
    });
  });
});
