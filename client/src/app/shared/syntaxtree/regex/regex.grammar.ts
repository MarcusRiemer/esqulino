import * as Schema from "../grammar.description";

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  id: "f28a9a42-73c7-4214-9aba-17443acfc5ce",
  name: "regex",
  programmingLanguageId: "regex",
  root: { languageName: "regex", typeName: "expression" },
  foreignTypes: {},
  types: {
    regex: {
      empty: {
        type: "concrete",
        attributes: [],
      },
      group: {
        type: "concrete",
        attributes: [
          {
            type: "terminal",
            symbol: "(",
          },
          {
            name: "subexpressions",
            type: "sequence",
            nodeTypes: [
              {
                occurs: "+",
                nodeType: {
                  typeName: "subexpression",
                  languageName: "regex",
                },
              },
            ],
          },
          {
            type: "terminal",
            symbol: ")",
          },
        ],
      },
      number: {
        type: "concrete",
        attributes: [
          {
            base: "integer",
            name: "number",
            type: "property",
          },
        ],
      },
      negation: {
        type: "concrete",
        attributes: [
          {
            type: "terminal",
            symbol: "^",
          },
        ],
      },
      lineTails: {
        type: "concrete",
        attributes: [
          {
            base: "string",
            name: "tail",
            type: "property",
          },
        ],
      },
      characters: {
        type: "concrete",
        attributes: [
          {
            base: "string",
            name: "chars",
            type: "property",
          },
        ],
      },
      expression: {
        type: "concrete",
        attributes: [
          {
            name: "subexpressions",
            type: "sequence",
            nodeTypes: [
              {
                occurs: "+",
                nodeType: {
                  typeName: "subexpression",
                  languageName: "regex",
                },
              },
            ],
          },
        ],
      },
      alternative: {
        type: "concrete",
        attributes: [
          {
            type: "terminal",
            symbol: "|",
          },
        ],
      },
      anyCharacter: {
        type: "concrete",
        attributes: [
          {
            type: "terminal",
            symbol: ".",
          },
        ],
      },
      numberOrEmpty: {
        type: "oneOf",
        oneOf: [
          {
            typeName: "number",
            languageName: "regex",
          },
          {
            typeName: "empty",
            languageName: "regex",
          },
        ],
      },
      subexpression: {
        type: "oneOf",
        oneOf: [
          {
            typeName: "characters",
            languageName: "regex",
          },
          {
            typeName: "knownCharacterClass",
            languageName: "regex",
          },
          {
            typeName: "characterRange",
            languageName: "regex",
          },
          {
            typeName: "alternative",
            languageName: "regex",
          },
          {
            typeName: "group",
            languageName: "regex",
          },
          {
            typeName: "quantifierClass",
            languageName: "regex",
          },
          {
            typeName: "quantifierRange",
            languageName: "regex",
          },
          {
            typeName: "lineTails",
            languageName: "regex",
          },
          {
            typeName: "anyCharacter",
            languageName: "regex",
          },
        ],
      },
      characterRange: {
        type: "concrete",
        attributes: [
          {
            type: "terminal",
            symbol: "[",
          },
          {
            name: "characters",
            type: "sequence",
            nodeTypes: [
              {
                occurs: "+",
                nodeType: {
                  typeName: "characterRangeItem",
                  languageName: "regex",
                },
              },
            ],
          },
          {
            type: "terminal",
            symbol: "]",
          },
        ],
      },
      quantifierClass: {
        type: "concrete",
        attributes: [
          {
            base: "string",
            name: "quantifierClass",
            type: "property",
          },
        ],
      },
      quantifierRange: {
        type: "concrete",
        attributes: [
          {
            type: "terminal",
            symbol: "{",
          },
          {
            name: "bounds",
            type: "sequence",
            nodeTypes: [
              {
                typeName: "number",
                languageName: "regex",
              },
              {
                occurs: "?",
                nodeType: {
                  typeName: "numberOrEmpty",
                  languageName: "regex",
                },
              },
            ],
          },
          {
            type: "terminal",
            symbol: "}",
          },
        ],
      },
      characterRangeItem: {
        type: "oneOf",
        oneOf: [
          {
            typeName: "characters",
            languageName: "regex",
          },
          {
            typeName: "knownCharacterClass",
            languageName: "regex",
          },
          {
            typeName: "negation",
            languageName: "regex",
          },
        ],
      },
      knownCharacterClass: {
        type: "concrete",
        attributes: [
          {
            type: "terminal",
            symbol: "\\",
          },
          {
            base: "string",
            name: "characterClass",
            type: "property",
          },
        ],
      },
    },
  },
};
