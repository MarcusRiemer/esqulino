import * as Schema from '../validator.description'

export const LANG_DESCRIPTION: Schema.LanguageDescription = {
  languageName: "sql",
  types: {
    "tablename": {
      properties: {
        "name": { base: "string" },
        "alias": { base: "string" }
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
        "as": { base: "string" }
      }
    },
    "starOperator": {},
    "binaryOperator": {
      properties: {
        "value": {
          base: "string"
        }
      }
    },
    "binaryExpression": {
      children: {
        "operands": {
          type: "sequence",
          nodeTypes: [
            "expression",
            "binaryOperator",
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
        "distinct": { base: "boolean" }
      }
    },
    "from": {
      children: {
        "tables": {
          type: "allowed",
          nodeTypes: ["tablename"]
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
