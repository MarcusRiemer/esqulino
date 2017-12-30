import * as Schema from '../validator.description'

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  languageName: "regex",
  types: {
    "constant": {
      properties: {
        "value": { base: "string" }
      }
    },
    "alternative": {
      children: {
        "expressions": {
          type: "allowed",
          nodeTypes: [
            {
              nodeType: {
                languageName: "regex",
                typeName: "expr",
              },
              minOccurs: 1
            }
          ]
        }
      }
    },
    "expr": {
      children: {
        "singleExpression": {
          type: "choice",
          choices: [
            {
              type: "sequence",
              nodeTypes: ["constant"]
            },
            {
              type: "sequence",
              nodeTypes: ["alternative"]
            }
          ]
        }
      }
    },
    "root": {
      children: {
        "expressions": {
          type: "allowed",
          nodeTypes: [
            {
              nodeType: {
                languageName: "regex",
                typeName: "expr",
              },
              minOccurs: 1
            }
          ]
        }
      }
    },
  },
  root: "root"
}
