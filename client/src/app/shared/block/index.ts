export * from './language-model'
export * from './editor-block'
export * from './sidebar-block'
export * from './block.description'

import { LanguageModel } from './language-model'

import * as Xml from './xml/language-model'
import * as DynamicXml from './dxml/language-model'
import * as RegEx from './regex/language-model'

export const AvailableLanguageModels = [
  new LanguageModel(Xml.LANGUAGE_MODEL),
  new LanguageModel(RegEx.LANGUAGE_MODEL),
  new LanguageModel(DynamicXml.LANGUAGE_MODEL)
]
