import { GrammarDocument } from "./grammar.description";

export const GRAMMAR_ARITHMETIC_DESCRIPTION: GrammarDocument = {
  root: { languageName: "expr", typeName: "expression" },
  foreignTypes: {},
  visualisations: {},
  foreignVisualisations: {},
  types: {
    expr: {
      expression: {
        type: "oneOf",
        oneOf: ["constant"],
      },
      constant: {
        type: "concrete",
        attributes: [
          {
            type: "property",
            base: "integer",
            name: "value",
          },
        ],
      },
      binaryExpression: {
        type: "concrete",
        attributes: [
          {
            type: "sequence",
            name: "lhs",
            nodeTypes: ["expression"],
          },
          {
            type: "property",
            name: "operator",
            base: "string",
            restrictions: [
              {
                type: "enum",
                value: ["+", "-", "*", "/"],
              },
            ],
          },
          {
            type: "sequence",
            name: "rhs",
            nodeTypes: ["expression"],
          },
        ],
      },
    },
  },
};
