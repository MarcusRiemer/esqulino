import { LanguageDescription } from '../syntaxtree'

import { BlockDescription } from './block.description'

/**
 * Augments a language with information about the UI layer.
 */
export interface LanguageModelDescription {
  /**
   * The actual language that is augmented.
   */
  language: LanguageDescription;

  /**
   * All blocks that are known to this model.
   */
  blocks: BlockDescription[];
}
