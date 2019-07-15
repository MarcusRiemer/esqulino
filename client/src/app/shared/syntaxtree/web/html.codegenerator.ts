import { NodeConverterRegistration, CodeGeneratorProcess, OutputSeparator } from '../codegenerator'
import { Node } from '../syntaxtree'

export const HTML_CONVERTER: NodeConverterRegistration[] = [
  {
    type: {
      languageName: "html",
      typeName: "document"
    },
    converter: {
      init: function(node: Node, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment("---", node, OutputSeparator.NEW_LINE_AFTER);
        process.addConvertedFragment("<html>", node, OutputSeparator.NEW_LINE_AFTER);
        process.addConvertedFragment("</html>", node);
      }
    }
  },
]