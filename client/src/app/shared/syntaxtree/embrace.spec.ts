import { Node, NodeDescription, Tree } from './syntaxtree'
import { GrammarDescription } from './grammar.description';
import { Validator } from './validator';
import { embraceNode, _findPossibleLocations, _findMatch, _localEmbrace } from './embrace';
import { QualifiedTypeName } from './syntaxtree.description';

const EXPRESSION_GRAMMAR: GrammarDescription = {
  id: "2db01f1b-df39-48b1-8100-49803218f596",
  name: "Test Expressions",
  programmingLanguageId: "test",
  slug: "test-expr",
  root: "expr",
  technicalName: "expr",
  types: {
    "booleanExpression": {
      type: "oneOf",
      oneOf: ["booleanBinary", "booleanConstant", "negate"]
    },
    "booleanConstant": {
      type: "concrete",
      attributes: [
        {
          type: "property",
          name: "value",
          base: "boolean"
        }
      ]
    },
    "negate": {
      type: "concrete",
      attributes: [
        {
          type: "allowed",
          name: "expr",
          nodeTypes: ["booleanExpression"]
        }
      ]
    },
    "booleanBinary": {
      type: "concrete",
      attributes: [
        {
          type: "allowed",
          name: "lhs",
          nodeTypes: ["booleanExpression"]
        },
        {
          type: "allowed",
          name: "rhs",
          nodeTypes: ["booleanExpression"]
        }
      ]
    },
    "noMatch": {
      type: "concrete",
      attributes: []
    }
  }
};

describe('AST: Embracing', () => {
  describe('_findPossibleLocations', () => {

    it('false with constant => []', () => {
      const parentDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          "value": "false"
        }
      };
      const fillType: QualifiedTypeName = { languageName: "expr", typeName: "constant" };
      const v = new Validator([EXPRESSION_GRAMMAR]);

      const res = _findPossibleLocations(new Node(parentDesc, undefined), fillType, v);
      expect(res).toEqual([]);
    });

    it('not(<hole>) with constant => [[expr, 0]]', () => {
      const parentDesc: NodeDescription = {
        language: "expr",
        name: "negate",
        children: {
          "expr": []
        }
      }
      const fillType: QualifiedTypeName = { languageName: "expr", typeName: "booleanConstant" };
      const v = new Validator([EXPRESSION_GRAMMAR]);

      const res = _findPossibleLocations(new Node(parentDesc, undefined), fillType, v);
      expect(res).toEqual([[["expr", 0]]]);
    });

    it('binary(false, <hole>) with constant => [[rhs, 0]]', () => {
      const parentDesc: NodeDescription = {
        language: "expr",
        name: "booleanBinary",
        children: {
          "lhs": [
            {
              language: "expr",
              name: "booleanConstant",
              properties: {
                "value": "false"
              }
            }
          ],
          "rhs": []
        }
      }
      const fillType: QualifiedTypeName = { languageName: "expr", typeName: "booleanConstant" };
      const v = new Validator([EXPRESSION_GRAMMAR]);

      const res = _findPossibleLocations(new Node(parentDesc, undefined), fillType, v);
      expect(res).toEqual([[["rhs", 0]]]);
    });

    it('binary(<hole>, false) with constant => [[lhs, 0]]', () => {
      const parentDesc: NodeDescription = {
        language: "expr",
        name: "booleanBinary",
        children: {
          "lhs": [],
          "rhs": [
            {
              language: "expr",
              name: "booleanConstant",
              properties: {
                "value": "false"
              }
            }
          ]
        }
      }
      const fillType: QualifiedTypeName = { languageName: "expr", typeName: "booleanConstant" };
      const v = new Validator([EXPRESSION_GRAMMAR]);

      const res = _findPossibleLocations(new Node(parentDesc, undefined), fillType, v);
      expect(res).toEqual([[["lhs", 0]]]);
    });
  });

  describe('_localEmbrace', () => {

    it("false into not(<here>)", () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          "value": "false"
        }
      };

      const embracingDescription: NodeDescription = {
        language: "expr",
        name: "negate",
        children: {
          "expr": []
        }
      };

      const embracedNode = new Tree(inTreeDesc).rootNode;

      const res = _localEmbrace(embracedNode, embracingDescription, [["expr", 0]]);

      const expDescription: NodeDescription = {
        language: "expr",
        name: "negate",
        children: {
          "expr": [inTreeDesc]
        }
      };

      expect(res).toEqual(expDescription);
    });
  });

  describe('_findMatch', () => {
    it('false against [not(<hole>)]', () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          "value": "false"
        }
      };

      const embraceCandidates: NodeDescription[] = [
        {
          language: "expr",
          name: "negate",
          children: {
            "expr": []
          }
        }
      ];

      const validator = new Validator([EXPRESSION_GRAMMAR]);

      const targetNode = new Tree(inTreeDesc).rootNode;
      const res = _findMatch(validator, targetNode, embraceCandidates);


      expect(res).toEqual([embraceCandidates[0], [["expr", 0]]]);
    });

    it('false against [not(true)]', () => {
      const inTreeDesc: NodeDescription = {
        language: "expr",
        name: "booleanConstant",
        properties: {
          "value": "false"
        }
      };

      const embraceCandidates: NodeDescription[] = [
        {
          language: "expr",
          name: "negate",
          children: {
            "expr": [
              {
                language: "expr",
                name: "booleanConstant",
                properties: {
                  "value": "true"
                }
              }
            ]
          }
        }
      ];

      const validator = new Validator([EXPRESSION_GRAMMAR]);

      const targetNode = new Tree(inTreeDesc).rootNode;
      const res = _findMatch(validator, targetNode, embraceCandidates);


      expect(res).toBeUndefined();
    });
  });

  it('<emptyTree> => not(<hole>)', () => {
    const embraceCandidates: NodeDescription[] = [
      {
        language: "expr",
        name: "negate",
        children: {
          "expr": []
        }
      }
    ];

    const validator = new Validator([EXPRESSION_GRAMMAR]);

    const prev = new Tree(undefined);
    const curr = embraceNode(validator, prev, [], embraceCandidates);

    const expTreeDesc: NodeDescription = {
      language: "expr",
      name: "negate",
      children: {
        "expr": []
      }
    };
    expect(curr.toModel()).toEqual(expTreeDesc);
  });

  it('false => not(false)', () => {
    const inTreeDesc: NodeDescription = {
      language: "expr",
      name: "booleanConstant",
      properties: {
        "value": "false"
      }
    };

    const embraceCandidates: NodeDescription[] = [
      {
        language: "expr",
        name: "negate",
        children: {
          "expr": []
        }
      }
    ];

    const validator = new Validator([EXPRESSION_GRAMMAR]);

    const prev = new Tree(inTreeDesc);
    const curr = embraceNode(validator, prev, [], embraceCandidates);

    const expTreeDesc: NodeDescription = {
      language: "expr",
      name: "negate",
      children: {
        "expr": [inTreeDesc]
      }
    };
    expect(curr.toModel()).toEqual(expTreeDesc);
  });

  it(`true => true (candidates don't match)`, () => {
    const inTreeDesc: NodeDescription = {
      language: "expr",
      name: "booleanConstant",
      properties: {
        "value": "false"
      }
    };

    const embraceCandidates: NodeDescription[] = [
      {
        language: "expr",
        name: "noMatch"
      }
    ];

    const validator = new Validator([EXPRESSION_GRAMMAR]);

    const prev = new Tree(inTreeDesc);
    const curr = embraceNode(validator, prev, [], embraceCandidates);

    expect(curr.toModel()).toEqual(inTreeDesc);
  });
});