import { NodeConverterRegistration, CodeGeneratorProcess, OutputSeparator } from '../codegenerator'
import { Node } from '../syntaxtree'

/**
 * Converts a Dynamic XML-AST to a properly indented XML document with eruby tags.
 */
export const NODE_CONVERTER: NodeConverterRegistration[] = [
  {
    type: {
      languageName: "dxml",
      typeName: "element"
    },
    converter: {
      init: function(node: Node, process: CodeGeneratorProcess) {
        const name = node.properties['name'];
        const attributes = node.getChildrenInCategory("attributes");

        // If there are no children the closing tag goes onto the same line
        // as the opening tag
        const childElements = node.getChildrenInCategory("elements");
        let openOutSep = OutputSeparator.NONE;
        let closeOutSep = OutputSeparator.NONE;

        if (childElements.length > 0) {
          openOutSep = OutputSeparator.NEW_LINE_BEFORE;
          closeOutSep = OutputSeparator.NEW_LINE_AFTER;
        }

        // Open tag, generate Attributes, add closing ">"
        process.addConvertedFragment(`<${name}`, node, OutputSeparator.NEW_LINE_BEFORE);
        attributes.forEach(attr => process.generateNode(attr));
        process.addConvertedFragment(`>`, node, closeOutSep);

        // Let the possible children render themselves. 
        childElements.forEach(c => process.generateNode(c));

        process.addConvertedFragment(`</${name}>`, node, openOutSep);
        return ([]);
      },
    }
  },
  {
    type: {
      languageName: "dxml",
      typeName: "attribute"
    },
    converter: {
      init: function(node: Node, process: CodeGeneratorProcess) {
        const key = node.properties['name'];
        process.addConvertedFragment(`${key}="`, node, OutputSeparator.SPACE_BEFORE);

        node.children['value'].forEach(child => process.generateNode(child));

        process.addConvertedFragment(`"`, node, OutputSeparator.NONE);
        return ([]);
      }
    }
  },
  {
    type: {
      languageName: "dxml",
      typeName: "text"
    },
    converter: {
      init: function(node: Node, process: CodeGeneratorProcess) {
        process.addConvertedFragment(node.properties['value'], node, OutputSeparator.NONE);
      }
    }
  },
  {
    type: {
      languageName: "dxml",
      typeName: "interpolate"
    },
    converter: {
      init: function(node: Node, process: CodeGeneratorProcess) {
        process.addConvertedFragment(`<%=`, node, OutputSeparator.SPACE_AFTER);
        process.generateNode(node.children['expr'][0])
        process.addConvertedFragment(`%>`, node, OutputSeparator.SPACE_BEFORE);
        return ([]);
      }
    }
  },
  {
    type: {
      languageName: "dxml",
      typeName: "expr"
    },
    converter: {
      init: function(node: Node, process: CodeGeneratorProcess) {
      }
    }
  },
  {
    type: {
      languageName: "dxml",
      typeName: "exprVar"
    },
    converter: {
      init: function(node: Node, process: CodeGeneratorProcess) {
        process.addConvertedFragment(node.properties['name'], node, OutputSeparator.NONE);
      }
    }
  }
];
