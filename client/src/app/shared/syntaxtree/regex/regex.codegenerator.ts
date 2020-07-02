import { NodeConverterRegistration, CodeGeneratorProcess } from '../codegenerator'
import { Node } from '../syntaxtree'

/**
 * Converts a RegEx-AST to a properly indented stringified representation.
 */
export const NODE_CONVERTER: NodeConverterRegistration[] = [
  {
    type: {
      languageName: "regex",
      typeName: "constant",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        // TODO: Escaping
        process.addConvertedFragment(node.properties["value"], node);
      },
    },
  },
  {
    type: {
      languageName: "regex",
      typeName: "alternative",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment("(", node);

        const alternatives = node.children["expressions"];
        alternatives.forEach((expr, i) => {
          if (i > 0) {
            process.addConvertedFragment("|", node);
          }
          process.generateNode(expr);
        });

        process.addConvertedFragment(")", node);
      },
    },
  },
  {
    type: {
      languageName: "regex",
      typeName: "expr",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        process.generateNode(node.children["singleExpression"][0]);
      },
    },
  },
  {
    type: {
      languageName: "regex",
      typeName: "root",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        // TODO: Dome something meaningful
        // const expressions = node.children["expressions"];
        // expressions.forEach((expr) => process.generateNode(expr));
      },
    },
  },
];
