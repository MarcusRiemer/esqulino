import { BlockLanguageDescription } from "../../../shared/block/block-language.description";
import { generateUUIDv4 } from '../../../shared/util';

const DEFAULT_EMPTY_BLOCKLANGUAGE: BlockLanguageDescription = {
  id: "96659508-e006-4290-926e-0734e7dd061a",
  name: "B1",
  sidebars: [],
  editorBlocks: [],
  editorComponents: [],
  defaultProgrammingLanguageId: "spec"
};

export const buildBlockLanguage = (
  override?: Partial<BlockLanguageDescription>
): BlockLanguageDescription => {
  return (Object.assign({ id: generateUUIDv4() }, DEFAULT_EMPTY_BLOCKLANGUAGE, override || {}));
};