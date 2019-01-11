import { NodeConverterRegistration, CodeGeneratorProcess, OutputSeparator } from '../codegenerator'
import { Node } from '../syntaxtree'

/**
 * An instance of this state is persisted between calls to the
 * existing converters.
 */
interface State {
  loopCounter: number;
}

export const DEFAULT_STATE: State = {
  loopCounter: 0
}

export const PROGRAM_NODE_CONVERTER: NodeConverterRegistration[] = [
  {
    type: {
      languageName: "trucklino_program",
      typeName: "program"
    },
    converter: {
      init: function(node: Node, process: CodeGeneratorProcess<State>) {
        process.addConvertedFragment("TODO!", node, OutputSeparator.NEW_LINE_AFTER);
      }
    }
  },
]