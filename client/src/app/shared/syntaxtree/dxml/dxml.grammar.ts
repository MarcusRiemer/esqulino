import * as Schema from '../grammar.description'

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  id: "7e333dff-6d1c-4042-aaa5-0cdf2cfeed7e",
  name: "dxml",
  technicalName: "dxml",
  programmingLanguageId: "dxml-eruby",
  root: { languageName: "dxml", typeName: "element" },
  types: {
    "dxml": {
      "element": {
        type: "concrete",
        attributes: [
          {
            name: "tag-open-begin",
            type: "terminal",
            symbol: "<",
          },
          {
            name: "name",
            type: "property",
            base: "string"
          },
          {
            name: "attributes",
            type: "allowed",
            nodeTypes: [
              { nodeType: "attribute", occurs: "*" },
            ]
          },
          {
            name: "tag-open-end",
            type: "terminal",
            symbol: ">",
          },
          {
            name: "elements",
            type: "allowed",
            nodeTypes: [
              { nodeType: "element", occurs: "*" },
              { nodeType: "text", occurs: "*" },
              { nodeType: "interpolate", occurs: "*" },
              { nodeType: "if", occurs: "*" },
            ]
          },
          {
            name: "tag-close",
            type: "terminal",
            symbol: "<ende/>",
          },
        ]
      },
      "attribute": {
        type: "concrete",
        attributes: [
          {
            name: "name",
            type: "property",
            base: "string"
          },
          {
            type: "terminal",
            name: "equals",
            symbol: "=",
          },
          {
            type: "terminal",
            name: "quot-begin",
            symbol: "\"",
          },
          {
            name: "value",
            type: "allowed",
            nodeTypes: [
              { nodeType: "text", occurs: "*" },
              { nodeType: "interpolate", occurs: "*" },
            ]
          },
          {
            type: "terminal",
            name: "quot-end",
            symbol: "\"",
          },
        ]
      },
      "text": {
        type: "concrete",
        attributes: [
          {
            name: "value",
            type: "property",
            base: "string"
          }
        ]
      },
      "interpolate": {
        type: "concrete",
        attributes: [
          {
            name: "expr",
            type: "allowed",
            nodeTypes: ["expr"]
          },
        ]
      },
      "if": {
        type: "concrete",
        attributes: [
          {
            name: "condition",
            type: "allowed",
            nodeTypes: ["expr"]
          },
          {
            name: "body",
            type: "allowed",
            nodeTypes: [
              { nodeType: "element", occurs: "*" },
              { nodeType: "text", occurs: "*" },
              { nodeType: "interpolate", occurs: "*" },
              { nodeType: "if", occurs: "*" },
            ],
          }
        ]
      },

      "expr": {
        type: "oneOf",
        oneOf: ["exprVar", "exprConst", "exprBinary"]
      },

      "exprVar": {
        type: "concrete",
        attributes: [
          {
            name: "name",
            type: "property",
            base: "string"
          }
        ]
      },
      "exprConst": {
        type: "concrete",
        attributes: [
          {
            name: "name",
            type: "property",
            base: "string"
          }
        ]
      },
      "exprBinary": {
        type: "concrete",
        attributes: [
          {
            name: "lhs",
            type: "allowed",
            nodeTypes: ["expr"]
          },
          {
            name: "operator",
            type: "allowed",
            nodeTypes: ["binaryOperator"]
          },
          {
            name: "rhs",
            type: "allowed",
            nodeTypes: ["expr"]
          }
        ]
      },
      "binaryOperator": {
        type: "concrete",
        attributes: [
          {
            name: "operator",
            type: "property",
            base: "string"
          }
        ]
      }
    },
  }
}
