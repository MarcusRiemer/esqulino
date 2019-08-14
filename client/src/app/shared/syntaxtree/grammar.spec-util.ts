import { GrammarDocument, NamedTypes, NamedLanguages } from './grammar.description';
import { QualifiedTypeName, NodeLocation } from './syntaxtree.description';
import { ValidationError, ValidationResult } from './validation-result';

export function singleLanguageGrammar(
  langName: string,
  rootType: string,
  types: NamedTypes
): GrammarDocument {
  const toReturn: GrammarDocument = {
    root: { languageName: langName, typeName: rootType },
    technicalName: langName,
    types: {},
  };

  // Types can't be assigned in the expression above because
  // the key is a variable.
  toReturn.types[langName] = types;

  return (toReturn);
}

export function multiLanguageGrammar(
  langName: string,
  rootType: QualifiedTypeName,
  languages: NamedLanguages
): GrammarDocument {
  return ({
    technicalName: langName,
    types: languages,
    root: rootType,
  });
}

export interface ComparableValidationError {
  code: string,
  location: NodeLocation,
}

/**
 * Actual errors may contain all sorts of circular references that are handy when
 */
export function comparableErrors(result: ValidationResult) {
  return (result.errors.map((e): ComparableValidationError => {
    return ({
      code: e.code,
      location: e.node.location
    });
  }));
}