import * as Schema from '../validator.description'

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  languageName: "dxml",
  types: {
    "element": {
      children: {
        "elements": {
          type: "allowed",
          nodeTypes: ["element", "text", "interpolate", "if"]
        },
        "attributes": {
          type: "allowed",
          nodeTypes: ["attribute"]
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
          nodeTypes: ["text", "interpolate"],
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
          type: "allowed",
          childCount: {
            minOccurs: 1,
            maxOccurs: 1,
          },
          nodeTypes: ["expr"]
        }
      }
    },
    "if": {
      children: {
        "condition": {
          type: "allowed",
          nodeTypes: [
            {
              nodeType: {
                languageName: "dxml",
                typeName: "expr"
              },
              minOccurs: 1,
              maxOccurs: 1,
            }
          ]
        },
        "body": {
          type: "allowed",
          nodeTypes: ["text", "element", "interpolate", "if"]
        }
      }
    },
    "expr": {
      children: {
        "concreteExpr": {
          type: "allowed",
          childCount: {
            minOccurs: 1,
            maxOccurs: 1
          },
          nodeTypes: ["exprVar", "exprConst", "exprBinary"]
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
