import {
  NodeConverterRegistration,
  CodeGeneratorProcess,
  OutputSeparator,
} from "../codegenerator";
import { Node } from "../syntaxtree";

/**
 * Converts a RegEx-AST to a properly indented stringified representation.
 */
export const NODE_CONVERTER: NodeConverterRegistration[] = [
  {
    type: {
      languageName: "regex",
      typeName: "expression",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        const subexpressions = node.getChildrenInCategory("subexpressions");
        if (subexpressions.length === 0) {
          process.addConvertedFragment(``, node);
        } else {
          process.indent(() => {
            subexpressions.forEach((c, i, a) => {
              process.generateNode(c);
              if (i < a.length - 1) {
                process.addConvertedFragment(``, node, OutputSeparator.NONE);
              }
            });
          });
        }
      },
    },
  },
  {
    type: {
      languageName: "regex",
      typeName: "characters",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(`"${node.properties["chars"]}"`, node);
      },
    },
  },
  {
    type: {
      languageName: "regex",
      typeName: "knownCharacterClass",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(
          `\\"${node.properties["characterClass"]}"`,
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
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        const characters = node.getChildrenInCategory("characters");
        if (characters.length === 0) {
          process.addConvertedFragment(`[]`, node);
        } else {
          process.addConvertedFragment(`[`, node, OutputSeparator.NONE);
          process.indent(() => {
            characters.forEach((c, i, a) => {
              process.generateNode(c);
              if (i < a.length - 1) {
                process.addConvertedFragment(``, node, OutputSeparator.NONE);
              }
            });
          });
          // TODO überlegen wegen a-z -> vllt n bool, welches wenn true dann ausgewertet wird? oder String abfrage welche nach - sucht?
          process.addConvertedFragment(`]`, node, OutputSeparator.NONE);
        }
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
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        const subexpressions = node.getChildrenInCategory("subexpressions");
        if (subexpressions.length === 0) {
          process.addConvertedFragment(`()`, node);
        } else {
          process.addConvertedFragment(`(`, node, OutputSeparator.NONE);
          process.indent(() => {
            subexpressions.forEach((c, i, a) => {
              process.generateNode(c);
              if (i < a.length - 1) {
                process.addConvertedFragment(``, node, OutputSeparator.NONE);
              }
            });
          });
          process.addConvertedFragment(`)`, node, OutputSeparator.NONE);
        }
      },
    },
  },
  {
    type: {
      languageName: "regex",
      typeName: "quantifierClass",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        // TODO validation?
        process.addConvertedFragment(
          `"${node.properties["quantifierClass"]}"`,
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
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(
          `{"${node.properties["lowerBound"]}", "${node.properties["upperBound"]}"}`,
          node
        );
      },
    },
  },
];
