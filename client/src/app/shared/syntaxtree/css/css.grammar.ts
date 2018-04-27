import * as Schema from '../validator.description'

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  languageName: "css",
  types: {
    "document": {
      attributes: [
        {
          name: "rules",
          type: "allowed",
          nodeTypes: [
            { nodeType: "rule", occurs: "*" }
          ]
        }
      ]
    } as Schema.NodeTypeDescription,

    "rule": {
      attributes: [
        {
          name: "selectors",
          type: "sequence",
          nodeTypes: [
            { nodeType: "selector", occurs: "*" }
          ]
        },
        {
          name: "declarations",
          type: "allowed",
          nodeTypes: [
            { nodeType: "declaration", occurs: "*" },
          ]
        }
      ]
    } as Schema.NodeTypeDescription,

    "selector": {
      oneOf: ["selectorType", "selectorClass", "selectorId", "selectorUniversal"]
    } as Schema.NodeTypeDescription,

    "selectorType": {
      attributes: [
        {
          name: "value",
          base: "string"
        }
      ]
    } as Schema.NodeTypeDescription,

    "selectorClass": {
      attributes: [
        {
          name: "value",
          base: "string"
        }
      ]
    } as Schema.NodeTypeDescription,

    "selectorId": {
      attributes: [
        {
          name: "value",
          base: "string"
        }
      ]
    } as Schema.NodeTypeDescription,

    "selectorUniversal": {

    } as Schema.NodeTypeDescription,

    "declaration": {
      attributes: [
        {
          name: "name",
          type: "choice",
          choices: ["propertyName"]
        },
        {
          name: "value",
          type: "choice",
          choices: ["exprColor", "exprAny"]
        }
      ]
    } as Schema.NodeTypeDescription,

    "exprColor": {
      attributes: [
        {
          name: "value",
          base: "string"
        }
      ]
    } as Schema.NodeTypeDescription,

    "exprAny": {
      attributes: [
        {
          name: "value",
          base: "string"
        }
      ]
    } as Schema.NodeTypeDescription,

    "propertyName": {
      attributes: [
        {
          name: "value",
          base: "string"
        }
      ]
    } as Schema.NodeTypeDescription

  },

  root: "document"
}
