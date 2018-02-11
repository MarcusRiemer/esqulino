import * as Schema from '../validator.description'

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  languageName: "sql",
  types: {
    "expression": {
      children: {
        "expression": {
          type: "choice",
          choices: [
            "columnName",
            "binaryExpression",
            "constant",
            "parameter",
            "functionCall"
          ]
        }
      }
    },
    "columnName": {
      properties: {
        "columnName": { base: "string" },
        "refTableName": { base: "string" },
      }
    },
    "constant": {
      properties: {
        "value": {
          base: "string"
        }
      }
    },
    "parameter": {
      properties: {
        "name": {
          base: "string"
        }
      }
    },
    "functionCall": {
      properties: {
        "name": {
          base: "string"
        }
      },
      children: {
        "arguments": {
          type: "sequence",
          nodeTypes: [
            {
              nodeType: "expression",
              occurs: "*"
            }
          ]
        }
      }
    },
    "starOperator": {},
    "relationalOperator": {
      properties: {
        "operator": {
          base: "string",
          restrictions: [
            {
              type: "enum",
              value: ["<", "<=", "=", ">=", ">"]
            }
          ]
        }
      }
    },
    "binaryExpression": {
      children: {
        "operands": {
          type: "sequence",
          nodeTypes: [
            "expression",
            "relationalOperator",
            "expression"
          ]
        }
      }
    },
    "select": {
      children: {
        "columns": {
          type: "allowed",
          nodeTypes: [
            {
              nodeType: "columnName",
              occurs: "*"
            },
            {
              nodeType: "starOperator",
              occurs: "?"
            }
          ]
        }
      },
      properties: {
        "distinct": {
          base: "boolean",
          isOptional: true
        }
      }
    },
    "delete": {

    },
    "tableIntroduction": {
      properties: {
        "name": { base: "string" },
        "alias": {
          base: "string",
          isOptional: true
        }
      }
    },
    "crossJoin": {
      children: {
        "table": {
          type: "sequence",
          nodeTypes: ["tableIntroduction"]
        }
      }
    },
    "innerJoinOn": {
      children: {
        "table": {
          type: "sequence",
          nodeTypes: ["tableIntroduction"]
        },
        "on": {
          type: "sequence",
          nodeTypes: ["expression"]
        },
      }
    },
    "innerJoinUsing": {
      children: {
        "table": {
          type: "sequence",
          nodeTypes: ["tableIntroduction"]
        },
        "using": {
          type: "sequence",
          nodeTypes: ["columnName"]
        }
      }
    },
    "join": {
      oneOf: ["crossJoin", "innerJoinUsing", "innerJoinOn"]
    },
    "from": {
      children: {
        "tables": {
          type: "sequence",
          nodeTypes: [
            "tableIntroduction",
            {
              nodeType: "join",
              occurs: "*"
            }
          ]
        }
      }
    },
    "whereAdditional": {
      children: {
        "expression": {
          type: "sequence",
          nodeTypes: ["expression"]
        }
      },
      properties: {
        "operator": {
          base: "string",
          value: ["and", "or"]
        }
      }
    },
    "where": {
      children: {
        "expressions": {
          type: "sequence",
          nodeTypes: [
            "expression",
            {
              languageName: "sql",
              nodeType: "whereAdditional",
              occurs: "*"
            }
          ]
        }
      }
    },
    "groupBy": {
      children: {
        "expressions": {
          type: "allowed",
          nodeTypes: [
            {
              languageName: "sql",
              nodeType: "expression",
              occurs: "*"
            },
            {
              languageName: "sql",
              nodeType: "columnName",
              occurs: "*"
            }
          ]
        }
      },
    },
    "querySelect": {
      children: {
        "select": {
          type: "sequence",
          nodeTypes: [
            "select",
          ]
        },
        "from": {
          type: "sequence",
          nodeTypes: [
            "from",
          ]
        },
        "where": {
          type: "sequence",
          nodeTypes: [
            {
              nodeType: "where",
              occurs: "?"
            },
          ]
        },
        "groupBy": {
          type: "sequence",
          nodeTypes: [
            {
              nodeType: "groupBy",
              occurs: "?"
            }
          ]
        },
      }
    },
    "queryDelete": {
      children: {
        "delete": {
          type: "sequence",
          nodeTypes: [
            "delete",
          ]
        },
        "from": {
          type: "sequence",
          nodeTypes: [
            "from",
          ]
        },
        "where": {
          type: "sequence",
          nodeTypes: [
            {
              nodeType: "where",
              occurs: "?"
            },
          ]
        },
        "groupBy": {
          type: "sequence",
          nodeTypes: [
            {
              nodeType: "groupBy",
              occurs: "?"
            },
          ]
        },
      }
    },
    "query": {
      oneOf: ["querySelect", "queryDelete"]
    }
  },
  root: "querySelect"
}
