export * from './block-language'
export * from './editor-block'
export * from './sidebar-block'
export * from './block.description'

import { BlockLanguage } from './block-language'

import * as DynamicXml from './dxml/language-model'
import * as RegEx from './regex/language-model'
import * as Sql from './sql/language-model'

export const AvailableLanguageModels = [
  new BlockLanguage(RegEx.LANGUAGE_MODEL),
  new BlockLanguage(DynamicXml.DYNAMIC_LANGUAGE_MODEL),
  new BlockLanguage(DynamicXml.LANGUAGE_MODEL),
  new BlockLanguage(Sql.LANGUAGE_MODEL)
]
