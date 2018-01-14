import * as Schema from '../validator.description'

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  languageName: "imp",
  types: {
    "program": {
      children: {
        "statements": {
          type: "sequence",
          childCount: {
            maxOccurs: Infinity,
            minOccurs: 0,
          },
          nodeTypes: ["statement"]
        }
      }
    },
    "statement": {
      children: {
        "statement": {
          type: "allowed",
          nodeTypes: ["statementAssign"],
        }
      }
    },
    "statementAssign": {
      children: {
        "variable": {
          type: "sequence",
          nodeTypes: ["variable"]
        }
      }
    },
    "variable": {
      properties: {
        "name": {
          base: "string"
        }
      }
    },
    "expression": {

    }
  },

  root: "program"
}
