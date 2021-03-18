import { NodeConverterRegistration } from "../codegenerator";
import {
  CodeGeneratorProcess,
  OutputSeparator,
} from "../codegenerator-process";
import { SyntaxNode } from "../syntaxtree";

export const WORLD_NODE_CONVERTER: NodeConverterRegistration[] = [
  {
    type: {
      languageName: "truck_world",
      typeName: "world",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<{}>) {
        process.addConvertedFragment(
          JSON.stringify(node.toModel()),
          node,
          OutputSeparator.NEW_LINE_AFTER
        );
      },
    },
  },
];
