import * as Schema from '../grammar.description'

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  id: "3889526b-3b6a-4e54-8b29-95b3526f8c5a",
  name: "imp",
  types: {
    "program": {
      attributes: [
        {
          name: "statements",
          type: "sequence",
          nodeTypes: ["statement"]
        }
      ],
    } as Schema.NodeTypeDescription,

    "statement": {
      attributes: [
        {
          name: "children",
          type: "allowed",
          nodeTypes: ["statementAssign"]
        }
      ]
    } as Schema.NodeTypeDescription,

    "statementAssign": {
      attributes: [
        {
          name: "children",
          type: "sequence",
          nodeTypes: ["variable"]
        }
      ]
    } as Schema.NodeTypeDescription,

    "variable": {
      attributes: [
        {
          name: "name",
          base: "string"
        }
      ],
    } as Schema.NodeTypeDescription,

    "expression": {

    } as Schema.NodeTypeDescription
  },

  root: "program"
}
