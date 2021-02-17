import {
  NodeConverterRegistration,
  CodeGeneratorProcess,
  OutputSeparator,
} from "../codegenerator";
import { Node } from "../syntaxtree";

export const NODE_CONVERTER: NodeConverterRegistration[] = [
  {
    type: {
      languageName: "json",
      typeName: "null",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(`null`, node);
      },
    },
  },
  {
    type: {
      languageName: "json",
      typeName: "string",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(`"${node.properties["value"]}"`, node);
      },
    },
  },
  {
    type: {
      languageName: "json",
      typeName: "number",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(`${+node.properties["value"]}`, node);
      },
    },
  },
  {
    type: {
      languageName: "json",
      typeName: "boolean",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(node.properties["value"], node);
      },
    },
  },
  {
    type: {
      languageName: "json",
      typeName: "array",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        const children = node.getChildrenInCategory("values");
        if (children.length === 0) {
          process.addConvertedFragment(`[]`, node);
        } else {
          process.addConvertedFragment(
            `[`,
            node,
            OutputSeparator.NEW_LINE_AFTER
          );
          process.indent(() => {
            children.forEach((c, i, a) => {
              process.generateNode(c);
              if (i < a.length - 1) {
                process.addConvertedFragment(
                  `,`,
                  node,
                  OutputSeparator.NEW_LINE_AFTER
                );
              }
            });
          });
          process.addConvertedFragment(
            `]`,
            node,
            OutputSeparator.NEW_LINE_BEFORE
          );
        }
      },
    },
  },
  {
    type: {
      languageName: "json",
      typeName: "object",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        const children = node.getChildrenInCategory("values");
        if (children.length === 0) {
          process.addConvertedFragment(`{}`, node);
        } else {
          process.addConvertedFragment(
            `{`,
            node,
            OutputSeparator.NEW_LINE_AFTER
          );
          process.indent(() => {
            children.forEach((c, i, a) => {
              process.generateNode(c);
              if (i < a.length - 1) {
                process.addConvertedFragment(
                  `,`,
                  node,
                  OutputSeparator.NEW_LINE_AFTER
                );
              }
            });
          });
          process.addConvertedFragment(
            `}`,
            node,
            OutputSeparator.NEW_LINE_BEFORE | OutputSeparator.NEW_LINE_AFTER
          );
        }
      },
    },
  },
  {
    type: {
      languageName: "json",
      typeName: "key-value",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        const key = node.getChildrenInCategory("key")[0];
        const value = node.getChildrenInCategory("value")[0];

        process.generateNode(key);
        process.addConvertedFragment(`:`, node, OutputSeparator.SPACE_AFTER);
        process.generateNode(value);
      },
    },
  },
];
