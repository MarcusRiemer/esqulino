import { NodeConverterRegistration } from "../codegenerator";
import { CodeGeneratorProcess } from "../codegenerator-process";
import { SyntaxNode } from "../syntaxtree";

/**
 * Converts a RegEx-AST to a properly stringified representation.
 */
export const REGEX_CONVERTER: NodeConverterRegistration[] = [
  {
    type: {
      languageName: "regex",
      typeName: "expression",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        const subexpressions = node.getChildrenInCategory("subexpressions");
        subexpressions.forEach((c, i, a) => {
          process.generateNode(c);
          if (i < a.length - 1) {
            process.addConvertedFragment(``, node);
          }
        });
      },
    },
  },
  {
    type: {
      languageName: "regex",
      typeName: "characters",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(`${node.properties["chars"]}`, node);
      },
    },
  },
  {
    type: {
      languageName: "regex",
      typeName: "knownCharacterClass",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(
          `\\${node.properties["characterClass"]}`,
          node
        );
      },
    },
  },
  {
    type: {
      languageName: "regex",
      typeName: "characterRange",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        const characters = node.getChildrenInCategory("characters");
        process.addConvertedFragment(`[`, node);
        characters.forEach((c, i, a) => {
          process.generateNode(c);
          if (i < a.length - 1) {
            process.addConvertedFragment(``, node);
          }
        });
        process.addConvertedFragment(`]`, node);
      },
    },
  },
  {
    type: {
      languageName: "regex",
      typeName: "alternative",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(`|`, node);
      },
    },
  },
  {
    type: {
      languageName: "regex",
      typeName: "group",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        const subexpressions = node.getChildrenInCategory("subexpressions");
        process.addConvertedFragment(`(`, node);
        subexpressions.forEach((c, i, a) => {
          process.generateNode(c);
          if (i < a.length - 1) {
            process.addConvertedFragment(``, node);
          }
        });
        process.addConvertedFragment(`)`, node);
      },
    },
  },
  {
    type: {
      languageName: "regex",
      typeName: "quantifierClass",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(
          `${node.properties["quantifierClass"]}`,
          node
        );
      },
    },
  },
  {
    type: {
      languageName: "regex",
      typeName: "quantifierRange",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        const bounds = node.getChildrenInCategory("bounds");
        process.addConvertedFragment(`{`, node);

        bounds.forEach((c, i, a) => {
          process.generateNode(c);
          if (i < a.length - 1) {
            process.addConvertedFragment(`, `, node);
          }
        });
        process.addConvertedFragment(`}`, node);
      },
    },
  },
  {
    type: {
      languageName: "regex",
      typeName: "lineTails",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(`${node.properties["tail"]}`, node);
      },
    },
  },
  {
    type: {
      languageName: "regex",
      typeName: "number",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(`${node.properties["number"]}`, node);
      },
    },
  },
  {
    type: {
      languageName: "regex",
      typeName: "empty",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(``, node);
      },
    },
  },
  {
    type: {
      languageName: "regex",
      typeName: "negation",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(`^`, node);
      },
    },
  },
  {
    type: {
      languageName: "regex",
      typeName: "anyCharacter",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(`.`, node);
      },
    },
  },
];
