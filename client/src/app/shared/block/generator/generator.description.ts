import { GrammarDescription } from '../../syntaxtree/grammar.description'
import { QualifiedTypeName } from '../../syntaxtree/syntaxtree.description'

import { EditorComponentDescription } from '../block-language.description'
import { VisualBlockDescriptions, SidebarDescription } from '../block.description'

import {
  AllTypeInstructions
} from './instructions.description'

/**
 * The nested parts of the generator description that must be stored
 * as a JSON "blob".
 */
export interface BlockLanguageGeneratorDocument {
  // The sidebars that are available in the editor. It would
  // be great to somehow generate those automatically, but for
  // moment these descriptions are simply copied.
  staticSidebars?: SidebarDescription[];

  // Extra editor components that are shown, currently these
  // are simply copied because there is not much to generate
  // here.
  editorComponents?: EditorComponentDescription[];

  // Define how to generate blocks for the mentioned types
  typeInstructions?: AllTypeInstructions;
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
 * we will use this handy default object instead of loading data from the server.
 */
export const DEFAULT_GENERATOR: BlockLanguageGeneratorDescription = {
  editorComponents: [],
  typeInstructions: {},
  id: undefined,
  name: undefined
};
