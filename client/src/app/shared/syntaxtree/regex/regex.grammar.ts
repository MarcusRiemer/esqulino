import * as Schema from '../grammar.description'

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  id: "f28a9a42-73c7-4214-9aba-17443acfc5ce",
  name: "regex",
  types: {
    "constant": {
      attributes: [
        {
          name: "value",
          type: "property",
          base: "string"
        }
      ]
    } as Schema.NodeTypeDescription,
    "alternative": {
      attributes: [
        {
          name: "expressions",
          type: "allowed",
          nodeTypes: [
            { nodeType: "expr", occurs: "+" }
          ]
        }
      ]
    },
    "expr": {
      attributes: [
        {
          name: "singleExpression",
          type: "choice",
          choices: ["constant", "alternative"]
        }
      ]
    },
    "root": {
      attributes: [
        {
          name: "expressions",
          type: "allowed",
          nodeTypes: [
            { nodeType: "expr", occurs: "+" }
          ]
        }
      ]
    },
  },
  root: "root"
}
