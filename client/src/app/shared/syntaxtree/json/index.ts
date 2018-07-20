import { LanguageDescription } from '../language.description'

// import { NODE_CONVERTER, NODE_CONVERTER } from './dxml.codegenerator'
import { GRAMMAR_DESCRIPTION } from './json.grammar'

export const LANGUAGE_DESCRIPTION: LanguageDescription = {
  id: "json",
  name: "JSON",
  emitters: [],
  validators: [GRAMMAR_DESCRIPTION]
}
