import * as Schema from '../validator.description'

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  languageName: "sql",
  types: {
    "expression": {
      oneOf: [
        "columnName",
        "binaryExpression",
        "constant",
        "parameter"
      ]
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
            "columnName",
            {
              nodeType: "starOperator",
              minOccurs: 0,
              maxOccurs: 1
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
    "from": {
      children: {
        "tables": {
          type: "sequence",
          nodeTypes: [
            "tableIntroduction",
            {
              languageName: "sql",
              nodeType: "crossJoin",
              minOccurs: 0,
              maxOccurs: +Infinity,
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
              minOccurs: 0,
              maxOccurs: +Infinity
            }
          ]
        }
      }
    },
    "querySelect": {
      children: {
        "components": {
          type: "sequence",
          nodeTypes: [
            "select",
            "from",
            {
              nodeType: "where",
              minOccurs: 0,
              maxOccurs: 1
            },
            {
              nodeType: "groupBy",
              minOccurs: 0,
              maxOccurs: 1
            }
          ]
        }
      }
    }
  },
  root: "querySelect"
}
