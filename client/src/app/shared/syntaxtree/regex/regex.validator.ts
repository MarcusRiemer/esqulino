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
        "options": {
          type: "allowed",
          nodeTypes: ["regex"]
        }
      }
    },
    "expr": {
      children: {
        "node": {
          type: "allowed",
          childCount: {
            maxOccurs: 1,
            minOccurs: 1,
          },
          nodeTypes: ["constant", "options"]
        }
      }
    }
  },
  root: "expr"
}
