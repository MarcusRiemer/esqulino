import { LanguageDescription } from '../language.description'

import { NODE_CONVERTER } from './regex.codegenerator'
import { GRAMMAR_DESCRIPTION } from './regex.validator'

export const LANGUAGE_DESCRIPTION: LanguageDescription = {
  id: "regex",
  name: "RegEx",
  generators: NODE_CONVERTER,
  validators: [GRAMMAR_DESCRIPTION]
}
