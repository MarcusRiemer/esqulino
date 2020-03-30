import * as Schema from "../grammar.description";

export const GRAMMAR_DESCRIPTION: Schema.GrammarDescription = {
  id: "f28a9a42-73c7-4214-9aba-17443acfc5ce",
  name: "regex",
  programmingLanguageId: "regex",
  root: { languageName: "regex", typeName: "root" },
  types: {
    regex: {
      constant: {
        type: "concrete",
        attributes: [
          {
            name: "value",
            type: "property",
            base: "string",
          },
        ],
      },
      alternative: {
        type: "concrete",
        attributes: [
          {
            name: "expressions",
            type: "allowed",
            nodeTypes: [{ nodeType: "expr", occurs: "+" }],
          },
        ],
      },
      expr: {
        type: "concrete",
        attributes: [
          {
            name: "singleExpression",
            type: "choice",
            choices: ["constant", "alternative"],
          },
        ],
      },
      root: {
        type: "concrete",
        attributes: [
          {
            name: "expressions",
            type: "allowed",
            nodeTypes: [{ nodeType: "expr", occurs: "+" }],
          },
        ],
      },
    },
  },
};
