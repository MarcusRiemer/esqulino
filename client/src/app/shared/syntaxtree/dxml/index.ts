import { LanguageDescription } from '../language.description'

import { NODE_CONVERTER } from './dxml.codegenerator'
import { VALIDATOR_DESCRIPTION } from './dxml.validator'

export const LANGUAGE_DESCRIPTION: LanguageDescription = {
  id: "dxml",
  name: "Dynamic XML",
  generators: NODE_CONVERTER,
  validators: [VALIDATOR_DESCRIPTION]
}
