import * as Schema from '../validator.description'

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  languageName: "sql",
  types: {
    "expression": {
      oneOf: [
        "columnName",
        "binaryExpression",
        "constant",
        "parameter",
        "functionCall"
      ]
    } as Schema.NodeTypeDescription,
    "columnName": {
      attributes: [
        {
          type: "property",
          name: "columnName",
          base: "string"
        },
        {
          type: "property",
          name: "refTableName",
          base: "string"
        }
      ]
    } as Schema.NodeTypeDescription,
    "constant": {
      attributes: [
        {
          type: "property",
          name: "value",
          base: "string"
        }
      ]
    } as Schema.NodeTypeDescription,
    "parameter": {
      attributes: [
        {
          type: "property",
          name: "name",
          base: "string"
        }
      ]
    } as Schema.NodeTypeDescription,
    "functionCall": {
      attributes: [
        {
          type: "property",
          name: "name",
          base: "string"
        },
        {
          type: "sequence",
          name: "arguments",
          nodeTypes: [
            {
              nodeType: "expression",
              occurs: "*"
            }
          ]
        }
      ]
    } as Schema.NodeTypeDescription,
    "starOperator": {
      attributes: []
    } as Schema.NodeTypeDescription,
    "relationalOperator": {
      attributes: [
        {
          type: "property",
          name: "operator",
          base: "string",
          restrictions: [
            {
              type: "enum",
              value: ["<", "<=", "=", ">=", ">", "LIKE", "NOT LIKE"]
            }
          ]
        }
      ]
    } as Schema.NodeTypeDescription,
    "binaryExpression": {
      attributes: [
        {
          type: "sequence",
          name: "lhs",
          nodeTypes: [
            "expression"
          ]
        },
        {
          type: "sequence",
          name: "operator",
          nodeTypes: [
            "relationalOperator"
          ]
        }, {
          type: "sequence",
          name: "rhs",
          nodeTypes: [
            "expression"
          ]
        }
      ]
    } as Schema.NodeTypeDescription,
    "select": {
      attributes: [
        {
          type: "property",
          name: "distinct",
          base: "boolean",
          isOptional: true
        },
        {
          type: "allowed",
          name: "columns",
          nodeTypes: [
            {
              nodeType: "expression",
              occurs: "*"
            },
            {
              nodeType: "starOperator",
              occurs: "?"
            }
          ]
        }
      ]
    } as Schema.NodeTypeDescription,
    "delete": {
      attributes: []
    } as Schema.NodeTypeDescription,
    "tableIntroduction": {
      attributes: [
        {
          type: "property",
          name: "name",
          base: "string"
        },
        {
          type: "property",
          name: "alias",
          base: "string",
          isOptional: true
        }
      ]
    } as Schema.NodeTypeDescription,
    "crossJoin": {
      attributes: [
        {
          type: "sequence",
          name: "table",
          nodeTypes: ["tableIntroduction"]
        }
      ]
    } as Schema.NodeTypeDescription,
    "innerJoinOn": {
      attributes: [
        {
          type: "sequence",
          name: "table",
          nodeTypes: ["tableIntroduction"]
        },
        {
          type: "sequence",
          name: "on",
          nodeTypes: ["expression"]
        }
      ]
    } as Schema.NodeTypeDescription,
    "innerJoinUsing": {
      attributes: [
        {
          type: "sequence",
          name: "table",
          nodeTypes: ["tableIntroduction"]
        },
        {
          type: "sequence",
          name: "using",
          nodeTypes: ["expression"]
        }
      ]
    } as Schema.NodeTypeDescription,
    "join": {
      oneOf: ["crossJoin", "innerJoinUsing", "innerJoinOn"]
    } as Schema.NodeTypeDescription,
    "from": {
      attributes: [
        {
          type: "sequence",
          name: "tables",
          nodeTypes: [
            {
              nodeType: "tableIntroduction",
              occurs: "+"
            }
          ]
        },
        {
          type: "sequence",
          name: "joins",
          nodeTypes: [
            {
              nodeType: "join",
              occurs: "*"
            }
          ]
        }
      ]
    } as Schema.NodeTypeDescription,
    "whereAdditional": {
      attributes: [
        {
          type: "property",
          name: "operator",
          base: "string",
          value: ["and", "or"]
        },
        {
          type: "sequence",
          name: "expression",
          nodeTypes: ["expression"]
        }
      ]
    } as Schema.NodeTypeDescription,
    "where": {
      attributes: [
        {
          type: "sequence",
          name: "expressions",
          nodeTypes: [
            "expression",
            {
              languageName: "sql",
              nodeType: "whereAdditional",
              occurs: "*"
            }
          ]
        }
      ]
    } as Schema.NodeTypeDescription,
    "groupBy": {
      attributes: [
        {
          type: "allowed",
          name: "expressions",
          nodeTypes: [
            {
              languageName: "sql",
              nodeType: "expression",
              occurs: "*"
            }
          ]
        }
      ]
    } as Schema.NodeTypeDescription,
    "orderBy": {
      attributes: [
        {
          type: "allowed",
          name: "expressions",
          nodeTypes: [
            {
              languageName: "sql",
              nodeType: "expression",
              occurs: "*"
            }
          ]
        }
      ]
    } as Schema.NodeTypeDescription,
    "querySelect": {
      attributes: [
        {
          type: "sequence",
          name: "select",
          nodeTypes: [
            "select",
          ]
        },
        {
          type: "sequence",
          name: "from",
          nodeTypes: [
            "from",
          ]
        },
        {
          type: "sequence",
          name: "where",
          nodeTypes: [
            {
              nodeType: "where",
              occurs: "?"
            },
          ]
        },
        {
          type: "sequence",
          name: "groupBy",
          nodeTypes: [
            {
              nodeType: "groupBy",
              occurs: "?"
            },
          ]
        },
        {
          type: "sequence",
          name: "orderBy",
          nodeTypes: [
            {
              nodeType: "orderBy",
              occurs: "?"
            },
          ]
        },
      ]
    } as Schema.NodeTypeDescription,
    "queryDelete": {
      attributes: [
        {
          type: "sequence",
          name: "delete",
          nodeTypes: [
            "delete",
          ]
        },
        {
          type: "sequence",
          name: "from",
          nodeTypes: [
            "from",
          ]
        },
        {
          type: "sequence",
          name: "where",
          nodeTypes: [
            {
              nodeType: "where",
              occurs: "?"
            },
          ]
        }
      ]
    } as Schema.NodeTypeDescription,
    "query": {
      oneOf: ["querySelect", "queryDelete"]
    } as Schema.NodeTypeDescription
  },
  root: "query"
}
