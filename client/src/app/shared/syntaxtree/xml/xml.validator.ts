import * as Schema from '../validator.description'

export const VALIDATOR_DESCRIPTION: Schema.ValidatorDescription = {
  languageName: "xml",
  types: {
    "node": {
      children: {
        "nodes": {
          type: "allowed",
          nodeTypes: ["node"]
        },
        "attributes": {
          type: "allowed",
          nodeTypes: ["attribute"]
        }
      },
      properties: {
        "name": { base: "string" }
      }
    },
    "attribute": {
      properties: {
        "key": { base: "string" },
        "value": { base: "string" }
      }
    }
  },
  root: "node"
}
