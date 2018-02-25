import { NodeConverterRegistration, CodeGeneratorProcess, OutputSeparator } from '../codegenerator'
import { Node } from '../syntaxtree'

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
      init: function(node: Node, process: CodeGeneratorProcess) {
        node.getChildrenInCategory("rules").forEach(c => {
          process.generateNode(c);
        });

        return ([]);
      }
    }
  },
  {
    type: {
      languageName: "css",
      typeName: "rule",
    },
    converter: {
      init: function(node: Node, process: CodeGeneratorProcess) {
        // Selector in a single line
        node.getChildrenInCategory("selectors").forEach(c => {
          process.generateNode(c);
        });

        // One liner per declaration
        process.addConvertedFragment("{", node, OutputSeparator.NEW_LINE_AFTER);
        node.getChildrenInCategory("declarations").forEach(c => {
          process.generateNode(c);
        });
        process.addConvertedFragment("}", node);

        return ([]);
      }
    }
  },
  {
    type: {
      languageName: "css",
      typeName: "selectorType",
    },
    converter: {
      init: function(node: Node, process: CodeGeneratorProcess) {
        process.addConvertedFragment(node.properties['value'], node, OutputSeparator.SPACE_AFTER);
      }
    }
  },
  {
    type: {
      languageName: "css",
      typeName: "selectorClass",
    },
    converter: {
      init: function(node: Node, process: CodeGeneratorProcess) {
        process.addConvertedFragment('.' + node.properties['value'], node, OutputSeparator.SPACE_AFTER);
      }
    }
  },
  {
    type: {
      languageName: "css",
      typeName: "selectorId",
    },
    converter: {
      init: function(node: Node, process: CodeGeneratorProcess) {
        process.addConvertedFragment('#' + node.properties['value'], node, OutputSeparator.SPACE_AFTER);
      }
    }
  },
  {
    type: {
      languageName: "css",
      typeName: "selectorUniversal",
    },
    converter: {
      init: function(node: Node, process: CodeGeneratorProcess) {
        process.addConvertedFragment('*', node, OutputSeparator.SPACE_AFTER);
      }
    }
  },
  {
    type: {
      languageName: "css",
      typeName: "declaration",
    },
    converter: {
      init: function(node: Node, process: CodeGeneratorProcess) {
        // El cheap indenting
        process.addConvertedFragment(' ', node, OutputSeparator.SPACE_AFTER);

        // <key>: <value>;
        process.addConvertedFragment(node.properties['key'], node);
        process.addConvertedFragment(':', node, OutputSeparator.SPACE_AFTER);
        process.addConvertedFragment(node.properties['value'], node);
        process.addConvertedFragment(';', node, OutputSeparator.NEW_LINE_AFTER);
      }
    }
  }
];
