export * from './language-model'
export * from './editor-block'
export * from './sidebar-block'
export * from './block.description'

import { LanguageModel } from './language-model'

import * as DynamicXml from './dxml/language-model'
import * as RegEx from './regex/language-model'
import * as Sql from './sql/language-model'

export const AvailableLanguageModels = [
  new LanguageModel(RegEx.LANGUAGE_MODEL),
  new LanguageModel(DynamicXml.DYNAMIC_LANGUAGE_MODEL),
  new LanguageModel(DynamicXml.LANGUAGE_MODEL),
  new LanguageModel(Sql.LANGUAGE_MODEL)
]
