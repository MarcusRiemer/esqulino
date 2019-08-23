import * as Schema from '../grammar.description'

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  id: "37719773-5893-46d5-b1ec-0b63f1ef9099",
  name: "css",
  programmingLanguageId: "css",
  root: { languageName: "css", typeName: "document" },
  types: {
    "css": {
      "document": {
        type: "concrete",
        attributes: [
          {
            name: "rules",
            type: "allowed",
            nodeTypes: [
              { nodeType: "rule", occurs: "*" }
            ]
          }
        ]
      },

      "rule": {
        type: "concrete",
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
      },

      "selector": {
        type: "oneOf",
        oneOf: ["selectorType", "selectorClass", "selectorId", "selectorUniversal"]
      },

      "selectorType": {
        type: "concrete",
        attributes: [
          {
            name: "value",
            type: "property",
            base: "string"
          }
        ]
      },

      "selectorClass": {
        type: "concrete",
        attributes: [
          {
            name: "value",
            type: "property",
            base: "string"
          }
        ]
      },

      "selectorId": {
        type: "concrete",
        attributes: [
          {
            name: "value",
            type: "property",
            base: "string"
          }
        ]
      },

      "selectorUniversal": {
        type: "concrete",
      },

      "declaration": {
        type: "concrete",
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
      },

      "exprColor": {
        type: "concrete",
        attributes: [
          {
            name: "value",
            type: "property",
            base: "string"
          }
        ]
      },

      "exprAny": {
        type: "concrete",
        attributes: [
          {
            name: "value",
            type: "property",
            base: "string"
          }
        ]
      },

      "propertyName": {
        type: "concrete",
        attributes: [
          {
            name: "name",
            type: "property",
            base: "string"
          }
        ]
      }
    },
  },
}
