import {
  NodeConverterRegistration,
  CodeGeneratorProcess,
  OutputSeparator,
} from "../codegenerator";
import { Node } from "../syntaxtree";

/**
 * Emitting the basic HTML structures: Elements, Attributes and "normal" text
 */
const NODE_CONVERTER_BASE: NodeConverterRegistration[] = [
  {
    type: {
      languageName: "dxml",
      typeName: "element",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        const name = node.properties["name"];
        const attributes = node.getChildrenInCategory("attributes");

        // If there are no children the closing tag goes onto the same line
        // as the opening tag
        const childElements = node.getChildrenInCategory("elements");
        let openEndSep = OutputSeparator.NONE;
        let closeEndSep = OutputSeparator.NONE;

        if (childElements.length > 0) {
          openEndSep = OutputSeparator.NEW_LINE_BEFORE;
          closeEndSep = OutputSeparator.NEW_LINE_AFTER;
        }

        // Open tag, generate Attributes, add closing ">"
        process.addConvertedFragment(
          `<${name}`,
          node,
          OutputSeparator.NEW_LINE_BEFORE
        );
        attributes.forEach((attr) => process.generateNode(attr));
        process.addConvertedFragment(`>`, node, closeEndSep);

        // Let the possible children render themselves.
        process.indent(() => {
          childElements.forEach((c) => process.generateNode(c));
        });

        process.addConvertedFragment(`</${name}>`, node, openEndSep);
      },
    },
  },
  {
    type: {
      languageName: "dxml",
      typeName: "attribute",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        const key = node.properties["name"];
        process.addConvertedFragment(
          `${key}="`,
          node,
          OutputSeparator.SPACE_BEFORE
        );

        node.children["value"].forEach((child) => process.generateNode(child));

        process.addConvertedFragment(`"`, node, OutputSeparator.NONE);
      },
    },
  },
  {
    type: {
      languageName: "dxml",
      typeName: "text",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(
          node.properties["value"],
          node,
          OutputSeparator.NONE
        );
      },
    },
  },
];

/**
 * Converts a Dynamic XML-AST to a properly indented XML document with eruby tags.
 */
export const NODE_CONVERTER_ERUBY = [
  ...NODE_CONVERTER_BASE,
  {
    type: {
      languageName: "dxml",
      typeName: "interpolate",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(`<%=`, node, OutputSeparator.SPACE_AFTER);
        process.generateNode(node.children["expr"][0]);
        process.addConvertedFragment(`%>`, node, OutputSeparator.SPACE_BEFORE);
      },
    },
  },
  {
    type: {
      languageName: "dxml",
      typeName: "expr",
    },
    converter: {
      init: function (_node: Node, _process: CodeGeneratorProcess<{}>) {},
    },
  },
  {
    type: {
      languageName: "dxml",
      typeName: "exprVar",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(
          node.properties["name"],
          node,
          OutputSeparator.NONE
        );
      },
    },
  },
  {
    type: {
      languageName: "dxml",
      typeName: "if",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        const condition = node.children["condition"][0];
        const body = node.getChildrenInCategory("body");

        process.addConvertedFragment(
          `<% if`,
          node,
          OutputSeparator.SPACE_AFTER
        );
        process.generateNode(condition);
        process.addConvertedFragment(``, node, OutputSeparator.SPACE_BEFORE);
        process.addConvertedFragment(
          `%>`,
          node,
          OutputSeparator.NEW_LINE_AFTER
        );

        body.forEach((e) => process.generateNode(e));

        process.addConvertedFragment(
          `<% end %>`,
          node,
          OutputSeparator.NEW_LINE_BEFORE
        );
      },
    },
  },
  {
    type: {
      languageName: "dxml",
      typeName: "exprBinary",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        const children = node
          .getChildrenInCategory("lhs")
          .concat(node.getChildrenInCategory("operator"))
          .concat(node.getChildrenInCategory("rhs"));

        // The binary expression needs spaces around all nodes
        children.forEach((c) => {
          process.addConvertedFragment(``, node, OutputSeparator.SPACE_BEFORE);
          process.generateNode(c);
        });

        process.addConvertedFragment(``, node, OutputSeparator.SPACE_AFTER);
      },
    },
  },
  {
    type: {
      languageName: "dxml",
      typeName: "binaryOperator",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(
          node.properties["operator"],
          node,
          OutputSeparator.NONE
        );
      },
    },
  },
];

/**
 * Converts a Dynamic XML-AST to a properly indented XML document with liquid tags.
 */
export const NODE_CONVERTER_LIQUID = [
  ...NODE_CONVERTER_BASE,
  {
    type: {
      languageName: "dxml",
      typeName: "interpolate",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(`{{`, node, OutputSeparator.SPACE_AFTER);
        process.generateNode(node.children["expr"][0]);
        process.addConvertedFragment(`}}`, node, OutputSeparator.SPACE_BEFORE);
      },
    },
  },
  {
    type: {
      languageName: "dxml",
      typeName: "expr",
    },
    converter: {
      init: function (_node: Node, _process: CodeGeneratorProcess<{}>) {},
    },
  },
  {
    type: {
      languageName: "dxml",
      typeName: "exprVar",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(
          node.properties["name"],
          node,
          OutputSeparator.NONE
        );
      },
    },
  },
  {
    type: {
      languageName: "dxml",
      typeName: "if",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        const condition = node.children["condition"][0];
        const body = node.getChildrenInCategory("body");

        process.addConvertedFragment(
          `{% if`,
          node,
          OutputSeparator.SPACE_AFTER
        );
        process.generateNode(condition);
        process.addConvertedFragment(``, node, OutputSeparator.SPACE_BEFORE);
        process.addConvertedFragment(
          `%}`,
          node,
          OutputSeparator.NEW_LINE_AFTER
        );

        body.forEach((e) => process.generateNode(e));

        process.addConvertedFragment(
          `{% end %}`,
          node,
          OutputSeparator.NEW_LINE_BEFORE
        );
      },
    },
  },
  {
    type: {
      languageName: "dxml",
      typeName: "exprBinary",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        const children = node
          .getChildrenInCategory("lhs")
          .concat(node.getChildrenInCategory("operator"))
          .concat(node.getChildrenInCategory("rhs"));

        // The binary expression needs spaces around all nodes
        children.forEach((c) => {
          process.addConvertedFragment(``, node, OutputSeparator.SPACE_BEFORE);
          process.generateNode(c);
        });

        process.addConvertedFragment(``, node, OutputSeparator.SPACE_AFTER);
      },
    },
  },
  {
    type: {
      languageName: "dxml",
      typeName: "binaryOperator",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(
          node.properties["operator"],
          node,
          OutputSeparator.NONE
        );
      },
    },
  },
];
