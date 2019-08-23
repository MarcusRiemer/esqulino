import * as Schema from '../grammar.description'

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  id: "3889526b-3b6a-4e54-8b29-95b3526f8c5a",
  programmingLanguageId: "ruby",
  name: "imp",
  root: { languageName: "imp", typeName: "program" },
  types: {
    "imp": {
      "program": {
        type: "concrete",
        attributes: [
          {
            name: "statements",
            type: "sequence",
            nodeTypes: ["statement"]
          }
        ],
      },

      "statement": {
        type: "concrete",
        attributes: [
          {
            name: "children",
            type: "allowed",
            nodeTypes: ["statementAssign"]
          }
        ]
      },

      "statementAssign": {
        type: "concrete",
        attributes: [
          {
            name: "children",
            type: "sequence",
            nodeTypes: ["variable"]
          }
        ]
      },

      "variable": {
        type: "concrete",
        attributes: [
          {
            name: "name",
            type: "property",
            base: "string"
          }
        ],
      },

      "expression": {
        type: "concrete",
      }
    },
  }
}
