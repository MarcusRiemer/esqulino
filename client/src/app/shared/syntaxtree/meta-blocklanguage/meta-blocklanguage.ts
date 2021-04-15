import { BlockLanguageDescription } from "../../block/block-language.description";
import { NodeDescription, QualifiedTypeName } from "../syntaxtree.description";

export type BlockLanguageSettings = Pick<
  BlockLanguageDescription,
  "rootCssClasses"
>;

export function readFromNode(
  node: NodeDescription,
  throwOnError: boolean
): BlockLanguageSettings {
  return {
    rootCssClasses: ["activate-block-outline"],
  };
}
