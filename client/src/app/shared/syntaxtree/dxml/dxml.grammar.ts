import * as Schema from '../validator.description'

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  languageName: "dxml",
  types: {
    "element": {
      attributes: [
        {
          name: "name",
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
          name: "elements",
          type: "allowed",
          nodeTypes: [
            { nodeType: "element", occurs: "*" },
            { nodeType: "text", occurs: "*" },
            { nodeType: "interpolate", occurs: "*" },
            { nodeType: "if", occurs: "*" },
          ]
        }
      ]
    } as Schema.NodeTypeDescription,
    "attribute": {
      attributes: [
        {
          name: "name",
          base: "string"
        },
        {
          name: "value",
          type: "allowed",
          nodeTypes: [
            { nodeType: "text", occurs: "*" },
            { nodeType: "interpolate", occurs: "*" },
          ]
        },
      ]
    } as Schema.NodeTypeDescription,
    "text": {
      attributes: [
        {
          name: "value",
          base: "string"
        }
      ]
    } as Schema.NodeTypeDescription,
    "interpolate": {
      attributes: [
        {
          name: "children",
          type: "allowed",
          nodeTypes: ["expr"]
        },
      ]
    } as Schema.NodeTypeDescription,
    "if": {
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
    } as Schema.NodeTypeDescription,
    "expr": {
      oneOf: ["exprVar", "exprConst", "exprBinary"]
    } as Schema.NodeTypeDescription,
    "exprVar": {
      attributes: [
        {
          name: "name",
          base: "string"
        }
      ]
    } as Schema.NodeTypeDescription,
    "exprConst": {
      attributes: [
        {
          name: "name",
          base: "string"
        }
      ]
    } as Schema.NodeTypeDescription,
    "exprBinary": {
      attributes: [
        {
          name: "lhs",
          type: "allowed",
          nodeTypes: ["expr"]
        },
        {
          name: "operator",
          type: "allowed",
          nodeTypes: ["expr"]
        },
        {
          name: "rhs",
          type: "allowed",
          nodeTypes: ["expr"]
        }
      ]
    } as Schema.NodeTypeDescription,
    "binaryOperator": {
      attributes: [
        {
          name: "operator",
          base: "string"
        }
      ]
    } as Schema.NodeTypeDescription
  },

  root: "element"
}
