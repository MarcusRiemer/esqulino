import * as Schema from '../validator.description'

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  languageName: "dxml",
  types: {
    "element": {
      children: {
        "elements": {
          type: "allowed",
          nodeTypes: [
            {
              nodeType: {
                languageName: "dxml",
                typeName: "element"
              },
              minOccurs: 0
            },
            {
              nodeType: {
                languageName: "dxml",
                typeName: "text"
              },
              minOccurs: 0
            },
            {
              nodeType: {
                languageName: "dxml",
                typeName: "interpolate"
              },
              minOccurs: 0
            },
            {
              nodeType: {
                languageName: "dxml",
                typeName: "if"
              },
              minOccurs: 0
            },
          ]
        },
        "attributes": {
          type: "allowed",
          nodeTypes: [
            {
              nodeType: {
                languageName: "dxml",
                typeName: "attribute",
              },
              minOccurs: 0,
            }
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
            {
              nodeType: {
                languageName: "dxml",
                typeName: "text",
              },
              minOccurs: 0,
            },
            {
              nodeType: {
                languageName: "dxml",
                typeName: "interpolate",
              },
              minOccurs: 0,
            }
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
          choices: [
            {
              type: "sequence",
              nodeTypes: ["expr"]
            }
          ]
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
            {
              nodeType: {
                languageName: "dxml",
                typeName: "element"
              },
              minOccurs: 0
            },
            {
              nodeType: {
                languageName: "dxml",
                typeName: "text"
              },
              minOccurs: 0
            },
            {
              nodeType: {
                languageName: "dxml",
                typeName: "interpolate"
              },
              minOccurs: 0
            },
            {
              nodeType: {
                languageName: "dxml",
                typeName: "if"
              },
              minOccurs: 0
            },
          ],
        }
      }
    },
    "expr": {
      children: {
        "concreteExpr": {
          type: "choice",
          choices: [
            {
              type: "sequence",
              nodeTypes: ["exprVar"]
            },
            {
              type: "sequence",
              nodeTypes: ["exprConst"]
            },
            {
              type: "sequence",
              nodeTypes: ["exprBinary"]
            }
          ]
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
