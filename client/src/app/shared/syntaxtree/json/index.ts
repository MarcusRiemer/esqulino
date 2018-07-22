import { LanguageDescription } from '../language.description'

import { NODE_CONVERTER } from './json.codegenerator'
import { GRAMMAR_DESCRIPTION } from './json.grammar'

export const LANGUAGE_DESCRIPTION: LanguageDescription = {
  id: "json",
  name: "JSON",
  emitters: NODE_CONVERTER,
  validators: [GRAMMAR_DESCRIPTION]
}
