import {
  GrammarDocument,
  NamedTypes,
  NamedLanguages,
  VisualisedLanguages,
} from "./grammar.description";
import { QualifiedTypeName, NodeLocation } from "./syntaxtree.description";
import { ValidationResult } from "./validation-result";

export function mkSingleLanguageGrammar(
  langName: string,
  rootType: string,
  types: NamedTypes
): GrammarDocument {
  const toReturn: GrammarDocument = {
    root: { languageName: langName, typeName: rootType },
    types: {},
    foreignTypes: {},
    visualisations: {},
    foreignVisualisations: {},
  };

  // Types can't be assigned in the expression above because
  // the key is a variable.
  toReturn.types[langName] = types;

  return toReturn;
}

export function mkGrammarDoc(
  root: QualifiedTypeName,
  {
    types = {},
    foreignTypes = {},
    visualisations = {},
    foreignVisualisations = {},
  }: {
    types?: NamedLanguages;
    foreignTypes?: NamedLanguages;
    visualisations?: VisualisedLanguages;
    foreignVisualisations?: VisualisedLanguages;
  }
): GrammarDocument {
  return {
    types,
    foreignTypes,
    visualisations,
    foreignVisualisations,
    root,
  };
}

export function mkTypeGrammarDoc({
  types = {},
  foreignTypes = {},
  visualisations = {},
  foreignVisualisations = {},
}: {
  types?: NamedLanguages;
  foreignTypes?: NamedLanguages;
  visualisations?: VisualisedLanguages;
  foreignVisualisations?: VisualisedLanguages;
}): GrammarDocument {
  return {
    types,
    foreignTypes,
    visualisations,
    foreignVisualisations,
  };
}

export interface ComparableValidationError {
  code: string;
  location: NodeLocation;
}

/**
 * Actual errors may contain all sorts of circular references that are handy when
 */
export function comparableErrors(result: ValidationResult) {
  return result.errors.map((e): ComparableValidationError => {
    return {
      code: e.code,
      location: e.node.location,
    };
  });
}
