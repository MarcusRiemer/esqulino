export * from './language-model'
export * from './block'

import { LanguageModel } from './language-model'
import * as Xml from './xml/language-model'

export const AvailableLanguageModels = [
  new LanguageModel(Xml.LANGUAGE_MODEL)
]
