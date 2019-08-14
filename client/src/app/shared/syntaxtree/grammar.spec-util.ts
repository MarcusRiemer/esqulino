import { GrammarDocument, NamedTypes, NamedLanguages } from './grammar.description';
import { QualifiedTypeName } from './syntaxtree.description';

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