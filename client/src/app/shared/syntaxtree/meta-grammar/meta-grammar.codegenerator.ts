import { NodeConverterRegistration } from "../codegenerator";
import {
  CodeGeneratorProcess,
  OutputSeparator,
} from "../codegenerator-process";
import { Node } from "../syntaxtree";

import { readFromNode } from "./meta-grammar";

export const GRAMMAR_NODE_CONVERTER: NodeConverterRegistration[] = [
  {
    type: {
      languageName: "MetaGrammar",
      typeName: "grammar",
    },
    converter: {
      init: function (node: Node, process: CodeGeneratorProcess<{}>) {
        const grammarDocument = readFromNode(node.toModel());
        process.addConvertedFragment(
          JSON.stringify(grammarDocument, undefined, 2),
          node,
          OutputSeparator.NEW_LINE_AFTER
        );
      },
    },
  },
];
