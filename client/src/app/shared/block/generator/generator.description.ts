import { EditorComponentDescription } from '../block-language.description'
import { SidebarDescription } from '../block.description'

import { AllReferenceableTypeInstructions } from './instructions.description'
import { ParameterDeclarations, ParameterValues } from './parameters.description'

/**
 * The nested parts of the generator description that must be stored
 * as a JSON "blob".
 */
export interface BlockLanguageGeneratorDocument {
  // These parameters are required to generate the language
  parameterDeclarations?: ParameterDeclarations;

  // These values should match the parameters that are required
  parameterValues?: ParameterValues;

  // The sidebars that are available in the editor. It would
  // be great to somehow generate those automatically, but for
  // moment these descriptions are simply copied.
  staticSidebars?: SidebarDescription[];

  // Extra editor components that are shown, currently these
  // are simply copied because there is not much to generate
  // here.
  editorComponents?: EditorComponentDescription[];

  // Define how to generate blocks for the mentioned types
  typeInstructions?: AllReferenceableTypeInstructions;
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
