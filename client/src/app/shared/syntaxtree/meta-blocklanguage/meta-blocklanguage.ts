import { BlockLanguageDescription } from "../../block/block-language.description";
import { SyntaxTree } from "../syntaxtree";

import { NodeDescription, QualifiedTypeName } from "../syntaxtree.description";

export type BlockLanguageSettings = Pick<
  BlockLanguageDescription,
  "rootCssClasses"
>;

export function readFromNode(
  node: NodeDescription | SyntaxTree,
  _throwOnError = false
): BlockLanguageSettings {
  const tree = node instanceof SyntaxTree ? node : new SyntaxTree(node);

  const cssClasses = tree.rootNode
    .getChildrenInCategory("RootCssClasses")
    .map((cssNode) => cssNode.properties["Name"]);

  return {
    rootCssClasses: cssClasses,
  };
}
