export * from './language-model'
export * from './block'

import { LanguageModel } from './language-model'

import * as Xml from './xml/language-model'
import * as RegEx from './regex/language-model'

export const AvailableLanguageModels = [
  new LanguageModel(Xml.LANGUAGE_MODEL),
  new LanguageModel(RegEx.LANGUAGE_MODEL)
]
