import * as Schema from '../validator.description'

export const VALIDATOR_DESCRIPTION: Schema.ValidatorDescription = {
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
          nodeTypes: ["expr"]
        }
      }
    },
    "expr": {
      children: {
        "singleExpression": {
          type: "allowed",
          childCount: {
            maxOccurs: 1,
            minOccurs: 1,
          },
          nodeTypes: ["constant", "alternative"]
        }
      }
    },
    "root": {
      children: {
        "expressions": {
          type: "allowed",
          childCount: {
            minOccurs: 1,
            maxOccurs: +Infinity
          },
          nodeTypes: ["expr"]
        }
      }
    },
  },
  root: "root"
}
