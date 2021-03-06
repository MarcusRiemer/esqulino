import {
  NodeConcreteTypeDescription,
  GrammarDocument,
  NodeVisualTypeDescription,
} from "../../syntaxtree/grammar.description";

import { BlockLanguageDocument } from "../block-language.description";
import { EditorBlockDescription } from "../block.description";

import { GeneratorError } from "./error.description";
import { ManualBlockLanguageGeneratorDescription } from "./generator.description";
import { TraitMap } from "./traits";
import { ParameterMap } from "./parameters";
import { GeneratorInstructions } from "./instructions";
import { mapType } from "./type-mapping";
import { generateSidebar } from "./sidebar";
import { defaultEditorComponents } from "./generator-default";
import {
  getQualifiedTypes,
  ensureGrammarAttributeNames,
  allVisualisableTypes,
} from "../../syntaxtree/grammar-type-util";

/**
 * Ensures that there should be no errors during generation.
 */
export function validateManualGenerator(
  d: ManualBlockLanguageGeneratorDescription
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

  return toReturn;
}

/**
 * Takes a grammar description and a description how to transform it and
 * generates the corresponding block language.
 */
export function convertGrammarManualInstructions(
  d: ManualBlockLanguageGeneratorDescription,
  g: GrammarDocument
): BlockLanguageDocument {
  const allTypes = allVisualisableTypes(g);

  // If the grammar designer has decided to not name some things: This step still
  // relies on unique names so they have to be generated
  const strictlyNamedTypes = ensureGrammarAttributeNames(allTypes);

  // The blocks of the editor are based on the concrete types of the grammar,
  // "oneOf" types are not of interest here because they can never be nodes.
  const concreteTypes = getQualifiedTypes(strictlyNamedTypes).filter(
    (t) => t.type !== "oneOf"
  );

  // Some information is provided 1:1 by the generation instructions,
  // these can be copied over without further ado.
  const toReturn: BlockLanguageDocument = {
    editorBlocks: [],
    rootCssClasses: [],
    editorComponents: d.editorComponents || defaultEditorComponents,
    sidebars: (d.staticSidebars || []).map((sidebar) =>
      generateSidebar(strictlyNamedTypes, sidebar)
    ),
  };

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
  toReturn.editorBlocks = concreteTypes.map((t): EditorBlockDescription => {
    return {
      describedType: { languageName: t.languageName, typeName: t.typeName },
      visual: mapType(
        t as NodeConcreteTypeDescription | NodeVisualTypeDescription,
        instructions.typeInstructions(t.languageName, t.typeName)
      ),
    };
  });

  return toReturn;
}
