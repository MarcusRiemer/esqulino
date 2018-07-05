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
 * Describes how a grammar might be converted to a block language
 */
export interface BlockLanguageGeneratorDescription extends BlockLanguageGeneratorDocument {
  targetName: string;
  targetProgrammingLanguage: string;
}
