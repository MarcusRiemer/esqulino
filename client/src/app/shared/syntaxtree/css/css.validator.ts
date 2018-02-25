import * as Schema from '../validator.description'

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  languageName: "css",
  types: {
    "document": {
      children: {
        "rules": {
          type: "allowed",
          nodeTypes: [
            { nodeType: "rule", occurs: "*" }
          ]
        }
      }
    },
    "rule": {
      children: {
        "selectors": {
          type: "sequence",
          nodeTypes: [
            { nodeType: "selector", occurs: "*" }
          ]
        },
        "declarations": {
          type: "allowed",
          nodeTypes: [
            { nodeType: "declaration", occurs: "*" },
            { nodeType: "backgroundColor", occurs: "*" },
            { nodeType: "color", occurs: "*" },

          ]
        }
      }
    },
    "selector": {
      oneOf: ["selectorType", "selectorClass", "selectorId", "selectorUniversal"]
    },

    "selectorType": {
      properties: {
        "value": {
          base: "string"
        }
      }
    },

    "selectorClass": {
      properties: {
        "value": {
          base: "string"
        }
      }
    },

    "selectorId": {
      properties: {
        "value": {
          base: "string"
        }
      }
    },

    "selectorUniversal": {

    },

    "declaration": {
      properties: {
        "key": { base: "string" },
        "value": { base: "string" },
      }
    },

    "backgroundColor": {
      children: {
        "value": {
          type: "sequence",
          nodeTypes: ["exprColor"]
        }
      }
    },
    "color": {
      children: {
        "value": {
          type: "sequence",
          nodeTypes: ["exprColor"]
        }
      }
    },

    "exprColor": {
      properties: {
        "value": { base: "string" }
      }
    }

  },

  root: "document"
}
