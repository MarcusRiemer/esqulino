import { GrammarDescription } from '../syntaxtree/grammar.description'

import { EditorComponentDescription } from './block-language.description'

/**
 * The nested parts of the generator description that must be stored
 * as a JSON "blob".
 */
export interface BlockLanguageGeneratorDocument {
  editorComponents: EditorComponentDescription[];
}

/**
 * "Superficial" attribues of a block language generator
 */
export interface BlockLanguageGeneratorListDescription {
  id: string;
  name: string;
}

/**
 * Describes how a grammar might be converted to a block language
 */
export interface BlockLanguageGeneratorDescription extends BlockLanguageGeneratorDocument, BlockLanguageGeneratorListDescription {
}

/**
 * No idea how parameters for generators will work in the future. In the meantime
 * we will use this handy default object.
 */
export const DEFAULT_GENERATOR: BlockLanguageGeneratorDescription = {
  editorComponents: [],
  id: undefined,
  name: undefined
};
