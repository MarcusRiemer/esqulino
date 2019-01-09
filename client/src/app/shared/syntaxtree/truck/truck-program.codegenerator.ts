import { NodeConverterRegistration, CodeGeneratorProcess, OutputSeparator } from '../codegenerator'
import { Node } from '../syntaxtree'

export const PROGRAM_NODE_CONVERTER: NodeConverterRegistration[] = [
  {
    type: {
      languageName: "trucklino_program",
      typeName: "program"
    },
    converter: {
      init: function(node: Node, process: CodeGeneratorProcess) {
        process.addConvertedFragment("TODO!", node, OutputSeparator.NEW_LINE_AFTER);

        return ([]);
      }
    }
  },
]