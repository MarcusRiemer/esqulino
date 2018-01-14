import { LanguageDescription } from '../language.description'

import { NODE_CONVERTER } from './sql.codegenerator'
import { GRAMMAR_DESCRIPTION } from './sql.validator'

export const LANGUAGE_DESCRIPTION: LanguageDescription = {
  id: "sql",
  name: "SQL",
  generators: NODE_CONVERTER,
  validators: [GRAMMAR_DESCRIPTION]
}
