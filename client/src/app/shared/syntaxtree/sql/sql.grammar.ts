import * as Schema from '../grammar.description'

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  id: "7ec93f8a-5a01-4d4d-90b4-27c3f0ae4700",
  name: "sql",
  programmingLanguageId: "sql",
  types: {
    "expression": {
      type: "oneOf",
      oneOf: [
        "columnName",
        "binaryExpression",
        "constant",
        "parameter",
        "functionCall"
      ]
    },
    "columnName": {
      type: "concrete",
      attributes: [
        {
          type: "property",
          name: "refTableName",
          base: "string"
        },
        {
          type: "terminal",
          name: "dot",
          symbol: "."
        },
        {
          type: "property",
          name: "columnName",
          base: "string"
        },
      ]
    },
    "constant": {
      type: "concrete",
      attributes: [
        {
          type: "property",
          name: "value",
          base: "string"
        }
      ]
    },
    "parameter": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          name: "colon",
          symbol: ":"
        },
        {
          type: "property",
          name: "name",
          base: "string"
        }
      ]
    },
    "functionCall": {
      type: "concrete",
      attributes: [
        {
          type: "property",
          name: "name",
          base: "string"
        },
        {
          type: "terminal",
          name: "paren-open",
          symbol: "("
        },
        {
          type: "sequence",
          name: "arguments",
          nodeTypes: [
            {
              nodeType: "expression",
              occurs: "*"
            }
          ],
          between: {
            type: "terminal",
            name: "param-separator",
            symbol: ","
          }
        },
        {
          type: "terminal",
          name: "paren-close",
          symbol: ")"
        }
      ]
    },
    "starOperator": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          name: "star",
          symbol: "*"
        }
      ]
    },
    "relationalOperator": {
      type: "concrete",
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
    },
    "binaryExpression": {
      type: "concrete",
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
    },
    "select": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          name: "keyword",
          symbol: "SELECT"
        },
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
          ],
          between: {
            type: "terminal",
            name: "columnSeparator",
            symbol: ","
          }
        }
      ]
    },
    "delete": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          name: "keyword",
          symbol: "DELETE"
        },
      ]
    },
    "tableIntroduction": {
      type: "concrete",
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
    },
    "crossJoin": {
      type: "concrete",
      attributes: [
        {
          type: "sequence",
          name: "table",
          nodeTypes: ["tableIntroduction"]
        }
      ]
    },
    "innerJoinOn": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          name: "keyword",
          symbol: "INNER JOIN"
        },
        {
          type: "sequence",
          name: "table",
          nodeTypes: ["tableIntroduction"]
        },
        {
          type: "terminal",
          name: "keywordOn",
          symbol: "ON"
        },
        {
          type: "sequence",
          name: "on",
          nodeTypes: ["expression"]
        }
      ]
    },
    "innerJoinUsing": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          name: "keyword",
          symbol: "INNER JOIN"
        },
        {
          type: "sequence",
          name: "table",
          nodeTypes: ["tableIntroduction"]
        },
        {
          type: "terminal",
          name: "keywordUsing",
          symbol: "USING"
        },
        {
          type: "sequence",
          name: "using",
          nodeTypes: ["expression"]
        }
      ]
    },
    "join": {
      type: "oneOf",
      oneOf: ["crossJoin", "innerJoinUsing", "innerJoinOn"]
    },
    "from": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          name: "keyword",
          symbol: "FROM"
        },
        {
          type: "sequence",
          name: "tables",
          nodeTypes: [
            {
              nodeType: "tableIntroduction",
              occurs: "+"
            }
          ],
          between: {
            type: "terminal",
            name: "columnSeparator",
            symbol: ","
          }
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
    },
    "whereAdditional": {
      type: "concrete",
      attributes: [
        {
          type: "property",
          name: "operator",
          base: "string",
          restrictions: [
            { type: "enum", value: ["and", "or"] }
          ]
        },
        {
          type: "sequence",
          name: "expression",
          nodeTypes: ["expression"]
        }
      ]
    },
    "where": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          symbol: "WHERE",
          name: "keyword",
        },
        {
          type: "sequence",
          name: "expressions",
          nodeTypes: [
            {
              nodeType: {
                languageName: "sql",
                typeName: "expression"
              },
              occurs: "1"
            },
            {
              nodeType: {
                languageName: "sql",
                typeName: "whereAdditional"
              },
              occurs: "*"
            }
          ]
        }
      ]
    },
    "groupBy": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          name: "keyword",
          symbol: "GROUP BY"
        },
        {
          type: "allowed",
          name: "expressions",
          nodeTypes: [
            {
              nodeType: {
                languageName: "sql",
                typeName: "expression"
              },
              occurs: "*"
            },
          ],
          between: {
            type: "terminal",
            name: "columnSeparator",
            symbol: ","
          }
        }
      ]
    },
    "orderBy": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          name: "keyword",
          symbol: "ORDER BY"
        },
        {
          type: "allowed",
          name: "expressions",
          nodeTypes: [
            {
              nodeType: {
                languageName: "sql",
                typeName: "expression"
              },
              occurs: "*"
            },
          ],
          between: {
            type: "terminal",
            name: "columnSeparator",
            symbol: ","
          }
        }
      ]
    },
    "querySelect": {
      type: "concrete",
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
    },
    "queryDelete": {
      type: "concrete",
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
    },
    "query": {
      type: "oneOf",
      oneOf: ["querySelect", "queryDelete"]
    },
  },
  root: "query"
}
