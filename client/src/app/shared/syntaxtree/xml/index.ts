import { LanguageDescription } from '../language.description'

import { NODE_CONVERTER } from './xml.codegenerator'
import { VALIDATOR_DESCRIPTION } from './xml.validator'

export const LANGUAGE_DESCRIPTION: LanguageDescription = {
  id: "xml",
  name: "XML",
  generators: NODE_CONVERTER,
  validators: [VALIDATOR_DESCRIPTION]
}
