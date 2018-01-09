import * as Schema from '../validator.description'

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  languageName: "dxml",
  types: {
    "element": {
      children: {
        "elements": {
          type: "allowed",
          nodeTypes: [
            { nodeType: "element", occurs: "*" },
            { nodeType: "text", occurs: "*" },
            { nodeType: "interpolate", occurs: "*" },
            { nodeType: "if", occurs: "*" },
          ]
        },
        "attributes": {
          type: "allowed",
          nodeTypes: [
            { nodeType: "attribute", occurs: "*" },
          ]
        }
      },
      properties: {
        "name": {
          base: "string"
        }
      }
    },
    "attribute": {
      children: {
        "value": {
          type: "allowed",
          nodeTypes: [
            { nodeType: "text", occurs: "*" },
            { nodeType: "interpolate", occurs: "*" },
          ],
        }
      },
      properties: {
        name: {
          base: "string"
        }
      }
    },
    "text": {
      properties: {
        "value": {
          base: "string"
        }
      }
    },
    "interpolate": {
      children: {
        "expr": {
          type: "choice",
          choices: ["expr"]
        }
      }
    },
    "if": {
      children: {
        "condition": {
          type: "allowed",
          nodeTypes: ["expr"]
        },
        "body": {
          type: "allowed",
          nodeTypes: [
            { nodeType: "element", occurs: "*" },
            { nodeType: "text", occurs: "*" },
            { nodeType: "interpolate", occurs: "*" },
            { nodeType: "if", occurs: "*" },
          ],
        }
      }
    },
    "expr": {
      children: {
        "concreteExpr": {
          type: "choice",
          choices: ["exprVar", "exprConst", "exprBinary"]
        }
      }
    },
    "exprVar": {
      properties: {
        "name": {
          base: "string"
        }
      }
    },
    "exprConst": {
      properties: {
        "name": {
          base: "string"
        }
      }
    },
    "exprBinary": {
      children: {
        "exprBinary": {
          type: "sequence",
          nodeTypes: [
            "expr",
            "binaryOperator",
            "expr"
          ]
        }
      }
    },
    "binaryOperator": {
      properties: {
        "operator": {
          base: "string"
        }
      }
    }
  },

  root: "element"
}
