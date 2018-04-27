import * as Schema from '../validator.description'

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  languageName: "regex",
  types: {
    "constant": {
      attributes: [
        {
          name: "value",
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
