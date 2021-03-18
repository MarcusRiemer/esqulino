import { NodeConverterRegistration } from "../codegenerator";
import {
  CodeGeneratorProcess,
  OutputSeparator,
} from "../codegenerator-process";
import { SyntaxNode } from "../syntaxtree";
import { readFromNode } from "./regex-testbench.description";

/**
 * Converts regular expression testbenches to a printable JSON document.
 */
export const TESTBENCH_CONVERTER: NodeConverterRegistration[] = [
  {
    type: {
      languageName: "regex-testbench",
      typeName: "root",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        const testbenchDocument = readFromNode(node);
        process.addConvertedFragment(
          JSON.stringify(testbenchDocument, undefined, 2),
          node,
          OutputSeparator.NEW_LINE_AFTER
        );
      },
    },
  },
];
