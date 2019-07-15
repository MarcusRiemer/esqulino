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
        process.addConvertedFragment("---", node);
        process.addConvertedFragment("<html>", node);
        process.addConvertedFragment("</html>", node);
      }
    }
  },
]