import { GrammarDocument } from './grammar.description';

export function resolveIncludes(g: GrammarDocument): GrammarDocument {
  const toReturn: GrammarDocument = {
    includedGrammars: g.includedGrammars,
    root: g.root,
    technicalName: g.technicalName,
    types: {}
  }

  return (toReturn);
}