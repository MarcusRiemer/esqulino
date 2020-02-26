import { NodeConverterRegistration, CodeGeneratorProcess, OutputSeparator } from '../codegenerator'
import { Node } from '../syntaxtree'
import { readFromNode } from '../grammar.description';

export const GRAMMAR_NODE_CONVERTER: NodeConverterRegistration[] = [
  {
    type: {
      languageName: "MetaGrammar",
      typeName: "grammar"
    },
    converter: {
      init: function(node: Node, process: CodeGeneratorProcess<{}>) {
        const grammarDocument = readFromNode(node.toModel());
        process.addConvertedFragment(
          JSON.stringify(grammarDocument),
          node,
          OutputSeparator.NEW_LINE_AFTER
        );
      }
    }
  },
]