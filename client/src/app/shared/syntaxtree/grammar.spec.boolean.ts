import { GrammarDescription } from './grammar.description';

/**
 * This grammar describes a mini expression language for boolean values
 * and is used for testing.
 */
export const GRAMMAR_BOOLEAN_DESCRIPTION: GrammarDescription = {
  id: "2db01f1b-df39-48b1-8100-49803218f596",
  name: "Test Expressions",
  programmingLanguageId: "test",
  slug: "test-expr",
  root: { languageName: "expr", typeName: "booleanExpression" },
  types: {
    "expr": {
      "booleanExpression": {
        type: "oneOf",
        oneOf: ["booleanBinary", "booleanConstant", "negate", "parentheses"]
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
      "parentheses": {
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
  }
};
