import { GrammarDescription } from './grammar.description'
import { NodeConverterRegistration } from './codegenerator'

/**
 * Ties together descriptions of everything the editor would need to work
 * with a language.
 */
export interface LanguageDescription {
  id: string,
  name: string,
  validators: GrammarDescription[],
  emitters: NodeConverterRegistration[],
}
