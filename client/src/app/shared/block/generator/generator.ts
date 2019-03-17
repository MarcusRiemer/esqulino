import { NodeConcreteTypeDescription, GrammarDocument } from "../../syntaxtree/grammar.description";

import {
  BlockLanguageDocument, BlockLanguageListDescription, BlockLanguageDescription,
  EditorComponentDescription
} from "../block-language.description";
import { EditorBlockDescription } from "../block.description";

import { GeneratorError } from './error.description'
import { BlockLanguageGeneratorDocument } from "./generator.description";
import { TraitMap } from "./traits";
import { ParameterMap } from "./parameters";
import { GeneratorInstructions } from "./instructions";
import { mapType } from "./type-mapping";
import { generateSidebar } from './sidebar'

/**
 * These components are assumed to be part of every editor.
 */
const defaultEditorComponents: EditorComponentDescription[] = [
  {
    "componentType": "validator"
  },
  {
    "componentType": "generated-code"
  }
]

/**
 * Ensures that there should be no errors during generation.
 */
export function validateGenerator(
  d: BlockLanguageGeneratorDocument
): GeneratorError[] {
  const toReturn: GeneratorError[] = [];

  // Apply traits
  const traitMap = new TraitMap();
  traitMap.addKnownTraits(d.traits || {});
  traitMap.addScopes(d.traitScopes || []);
  const traitTypeInstructions = traitMap.applyTraits(d.typeInstructions || {});

  // Check whether something goes wrong during parameter resolving
  const parameters = new ParameterMap();
  parameters.addParameters(d.parameterDeclarations || {});
  parameters.addValues(d.parameterValues || {});
  toReturn.push(...parameters.validate(traitTypeInstructions));

  return (toReturn);
}

/**
 * Takes a grammar description and a description how to transform it and
 * generates the corresponding block language.
 */
export function convertGrammar(
  d: BlockLanguageGeneratorDocument,
  g: GrammarDocument
): BlockLanguageDocument {
  // Some information is provided 1:1 by the generation instructions,
  // these can be copied over without further ado.
  const toReturn: BlockLanguageDocument = {
    editorBlocks: [],
    editorComponents: d.editorComponents || defaultEditorComponents,
    sidebars: (d.staticSidebars || []).map(sidebar => generateSidebar(g, sidebar))
  };

  // The blocks of the editor are based on the concrete types of the grammar,
  // "oneOf" types are not of interest here because they can never be nodes.
  const concreteTypes = Object.entries(g.types)
    .filter(([_, v]) => v.type !== "oneOf") as [string, NodeConcreteTypeDescription][];

  // Apply traits
  const traitMap = new TraitMap();
  traitMap.addKnownTraits(d.traits || {});
  traitMap.addScopes(d.traitScopes || []);
  const traitTypeInstructions = traitMap.applyTraits(d.typeInstructions || {});

  // Grab the parameters and the values this generator defines
  const parameters = new ParameterMap();
  parameters.addParameters(d.parameterDeclarations || {});
  parameters.addValues(d.parameterValues || {});

  // The type instructions may contain references. The parameter map from the
  // previous step contains all values that these references may be resolved to.
  const resolvedTypeInstructions = parameters.resolve(traitTypeInstructions);

  // Wrap self contained instruction description in something that allows safe
  // access no matter whether the seeked value exists or not.
  const instructions = new GeneratorInstructions(resolvedTypeInstructions);

  // Look over every type that exists and see how it should be created
  toReturn.editorBlocks = concreteTypes.map(([tName, tDesc]): EditorBlockDescription => {
    return ({
      describedType: {
        languageName: g.technicalName,
        typeName: tName
      },
      visual: mapType(tDesc, instructions.typeInstructions(g.technicalName, tName))
    });
  });

  return (toReturn);
}

/**
 * Takes a whole block language and overwrites document properties that can
 * be re-generated by automatic conversion.
 */
export function generateBlockLanguage(
  l: BlockLanguageListDescription,
  d: BlockLanguageGeneratorDocument,
  g: GrammarDocument
): BlockLanguageDescription {
  const generated = convertGrammar(d, g);

  const toReturn = Object.assign({}, l, generated);

  return (toReturn);
}
