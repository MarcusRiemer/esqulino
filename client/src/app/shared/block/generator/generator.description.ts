import { EditorComponentDescription } from "../block-language.description";

import { AnySidebarDescription } from "./sidebar.description";
import { AllReferenceableTypeInstructions } from "./instructions.description";
import {
  ParameterDeclarations,
  ParameterValues,
} from "./parameters.description";
import { ReferenceableTraits, ScopeTraitAdd } from "./traits.description";

/**
 * Generator aspects that are probably part of every generation strategy.
 */
export interface CoreBlockLanguageGeneratorDescription {
  // These parameters are required to generate the language
  parameterDeclarations?: ParameterDeclarations;

  // These values should match the parameters that are required
  parameterValues?: ParameterValues;

  // The sidebars that are available in the editor. It would
  // be great to somehow generate those automatically, but for
  // moment these descriptions are simply copied.
  staticSidebars?: AnySidebarDescription[];

  // Extra editor components that are shown, currently these
  // are simply copied because there is not much to generate
  // here.
  editorComponents?: EditorComponentDescription[];
}

/**
 * A very manual approach to block language generation. Uses specific type
 * instructions and traits to
 */
export interface ManualBlockLanguageGeneratorDescription
  extends CoreBlockLanguageGeneratorDescription {
  // Discriminator value for this strategy
  type: "manual";

  // Define how to generate blocks for the mentioned types
  typeInstructions?: AllReferenceableTypeInstructions;

  // Groups together instructions for various types
  traits?: ReferenceableTraits;

  // Controls how traits are applied
  traitScopes?: ScopeTraitAdd[];
}

/**
 * Visualizes a block language by showing the tree structure. This is not
 * very user friendly but probably useful to debug.
 */
export interface TreeBlockLanguageGeneratorDescription
  extends CoreBlockLanguageGeneratorDescription {
  type: "tree";
}

/**
 * All possible instructions to generate a block language.
 */
export type BlockLanguageGeneratorDocument =
  | ManualBlockLanguageGeneratorDescription
  | TreeBlockLanguageGeneratorDescription;

/**
 * No idea how parameters for generators will work in the future. In the meantime
 * we will use this handy default object instead of loading data from the server.
 */
export const DEFAULT_GENERATOR: BlockLanguageGeneratorDocument = {
  type: "manual",
  editorComponents: [],
  typeInstructions: {},
};
