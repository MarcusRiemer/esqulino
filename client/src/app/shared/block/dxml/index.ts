import { BlockLanguageDescription } from '../block-language.description'
import { generateBlockLanguage } from '../generator/generator'

import { GRAMMAR_DESCRIPTION } from '../../syntaxtree/dxml/dxml.grammar'
import { GENERATOR_STATIC } from './generator'

export * from './generator'
export * from './language-model'

export const GENERATED_BLOCK_LANGUAGE_STATIC: BlockLanguageDescription = generateBlockLanguage(
  {
    id: "e4d39d58-2a64-42cf-9bc0-a2a5aaf403b2",
    slug: "xml-generated",
    name: "XML (Generiert, Statisch)",
    defaultProgrammingLanguageId: "dxml-eruby",
  },
  GENERATOR_STATIC,
  GRAMMAR_DESCRIPTION
);
