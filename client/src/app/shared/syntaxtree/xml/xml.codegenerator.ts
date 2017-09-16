import { NodeConverterRegistration, CodeGeneratorProcess, OutputSeparator } from '../codegenerator'
import { Node } from '../syntaxtree'

/**
 * Converts a XML-AST to a properly indented XML document.
 */
export const NODE_CONVERTER: NodeConverterRegistration[] = [
  {
    type: {
      languageName: "xml",
      typeName: "node"
    },
    converter: {
      init: function(node: Node, process: CodeGeneratorProcess) {
        const name = node.properties['name'];
        const attributes = node.getChildrenInCategory("attributes");
        if (attributes.length > 0) {
          // Open tag, generate Attributes, add closing ">"
          process.addConvertedFragment(`<${name}`, node, OutputSeparator.NEW_LINE_BEFORE);
          attributes.forEach(attr => process.generateNode(attr));
          process.addConvertedFragment(`>`, node);
        } else {
          // Emit the whole tag at once
          process.addConvertedFragment(`<${name}>`, node, OutputSeparator.NEW_LINE_BEFORE);
        }
        return (["nodes"]);
      },
      finish: function(node: Node, process: CodeGeneratorProcess) {
        const name = node.properties['name'];
        process.addConvertedFragment(`</${name}>`, node, OutputSeparator.NEW_LINE_BEFORE);
      }
    }
  },
  {
    type: {
      languageName: "xml",
      typeName: "attribute"
    },
    converter: {
      init: function(node: Node, process: CodeGeneratorProcess) {
        const key = node.properties['key'];
        const val = node.properties['value'];

        process.addConvertedFragment(`${key}="${val}"`, node, OutputSeparator.SPACE_BEFORE);
      }
    }
  }
];
