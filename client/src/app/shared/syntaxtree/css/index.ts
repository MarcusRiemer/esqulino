import { LanguageDescription } from '../language.description'

import { NODE_CONVERTER } from './css.codegenerator'
import { GRAMMAR_DESCRIPTION } from './css.validator'

export const LANGUAGE_DESCRIPTION: LanguageDescription = {
  id: "css",
  name: "CSS",
  generators: NODE_CONVERTER,
  validators: [GRAMMAR_DESCRIPTION]
}
