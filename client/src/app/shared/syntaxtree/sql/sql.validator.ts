import * as Schema from '../validator.description'

export const LANG_DESCRIPTION: Schema.LanguageDescription = {
  languageName: "sql",
  types: {
    "tableName": {
      properties: {
        "name": { base: "string" },
        "alias": {
          base: "string",
          isOptional: true
        }
      }
    },
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
    "select": {
      children: {
        "expressions": {
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
    "from": {
      children: {
        "tables": {
          type: "sequence",
          nodeTypes: [
            "tableName",
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
    "crossJoin": {
      children: {
        "table": {
          type: "sequence",
          nodeTypes: ["tableName"]
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
    "whereAdditional": {
      children: {
        "expression": {
          type: "sequence",
          nodeTypes: ["expression"]
        }
      },
      properties: {
        "operation": {
          base: "string",
          value: ["and", "or"]
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
