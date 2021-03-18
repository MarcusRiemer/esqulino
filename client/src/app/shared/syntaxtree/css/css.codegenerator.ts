import { NodeConverterRegistration } from "../codegenerator";
import {
  CodeGeneratorProcess,
  OutputSeparator,
} from "../codegenerator-process";
import { SyntaxNode } from "../syntaxtree";

/**
 * Converts an SQL-AST to a properly indented CSS document.
 */
export const NODE_CONVERTER: NodeConverterRegistration[] = [
  {
    type: {
      languageName: "css",
      typeName: "document",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        node.getChildrenInCategory("rules").forEach((c) => {
          process.generateNode(c);
        });
      },
    },
  },
  {
    type: {
      languageName: "css",
      typeName: "rule",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        // Selector in a single line
        node.getChildrenInCategory("selectors").forEach((c) => {
          process.generateNode(c);
        });

        // One liner per declaration
        process.addConvertedFragment("{", node, OutputSeparator.NEW_LINE_AFTER);
        node.getChildrenInCategory("declarations").forEach((c) => {
          process.generateNode(c);
        });
        process.addConvertedFragment("}", node);
      },
    },
  },
  {
    type: {
      languageName: "css",
      typeName: "selectorType",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(
          node.properties["value"],
          node,
          OutputSeparator.SPACE_AFTER
        );
      },
    },
  },
  {
    type: {
      languageName: "css",
      typeName: "selectorClass",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(
          "." + node.properties["value"],
          node,
          OutputSeparator.SPACE_AFTER
        );
      },
    },
  },
  {
    type: {
      languageName: "css",
      typeName: "selectorId",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(
          "#" + node.properties["value"],
          node,
          OutputSeparator.SPACE_AFTER
        );
      },
    },
  },
  {
    type: {
      languageName: "css",
      typeName: "selectorUniversal",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment("*", node, OutputSeparator.SPACE_AFTER);
      },
    },
  },
  {
    type: {
      languageName: "css",
      typeName: "declaration",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        // El cheapo indenting
        process.addConvertedFragment("  ", node);

        // <key>: <value>;
        node
          .getChildrenInCategory("name")
          .forEach((n) => process.generateNode(n));
        process.addConvertedFragment(":", node, OutputSeparator.SPACE_AFTER);
        node
          .getChildrenInCategory("value")
          .forEach((n) => process.generateNode(n));
        process.addConvertedFragment(";", node, OutputSeparator.NEW_LINE_AFTER);
      },
    },
  },
  {
    type: {
      languageName: "css",
      typeName: "propertyName",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(node.properties["name"], node);
      },
    },
  },
  {
    type: {
      languageName: "css",
      typeName: "exprColor",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(node.properties["value"], node);
      },
    },
  },
  {
    type: {
      languageName: "css",
      typeName: "exprAny",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(node.properties["value"], node);
      },
    },
  },
];
