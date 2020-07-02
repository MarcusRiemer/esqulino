import { LanguageDefinition } from '../language'
import { NODE_CONVERTER } from './regex.codegenerator'

export const LANGUAGE_DESCRIPTION: LanguageDefinition = {
  id: "regex",
  name: "RegEx",
  emitters: NODE_CONVERTER,
  validators: []
}
