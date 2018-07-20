import * as Schema from '../grammar.description'

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  id: "33e4959f-cf2d-481b-bb0c-06211e2ab0b3",
  name: "json",
  programmingLanguageId: "json",
  root: "value",
  types: {
    "object": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          symbol: "{",
          name: "object-open"
        },
        {
          type: "allowed",
          name: "values",
          nodeTypes: [
            { nodeType: "key-value", occurs: "*" }
          ]
        },
        {
          type: "terminal",
          symbol: "}",
          name: "object-close"
        },
      ]
    },
    "key-value": {
      type: "concrete",
      attributes: [
        {
          type: "property",
          name: "key",
          base: "string"
        },
        {
          type: "terminal",
          symbol: ":",
          name: "colon"
        },
        {
          type: "allowed",
          name: "value",
          nodeTypes: [
            { nodeType: "value", occurs: "1" }
          ]
        }
      ]
    },
    "array": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          symbol: "[",
          name: "array-open"
        },
        {
          type: "allowed",
          name: "values",
          nodeTypes: [
            { nodeType: "value", occurs: "*" }
          ]
        },
        {
          type: "terminal",
          symbol: "]",
          name: "array-close"
        },
      ]
    },
    "value": {
      type: "oneOf",
      oneOf: [
        "string", "number", "boolean", "object", "array", "null"
      ]
    },
    "string": {
      type: "concrete",
      attributes: [
        {
          type: "property",
          name: "value",
          base: "string"
        }
      ]
    },
    "number": {
      type: "concrete",
      attributes: [
        {
          type: "property",
          name: "value",
          base: "integer"
        }
      ]
    },
    "boolean": {
      type: "concrete",
      attributes: [
        {
          type: "property",
          name: "boolean",
          base: "boolean"
        }
      ]
    },
    "null": {
      type: "concrete",
      attributes: [
        {
          type: "terminal",
          name: "value",
          symbol: "null"
        }
      ]
    }
  }
}
