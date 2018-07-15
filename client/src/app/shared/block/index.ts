export * from './block-language'
export * from './editor-block'
export * from './sidebar'
export * from './fixed-blocks-sidebar'
export * from './block.description'

import { BlockLanguage } from './block-language'

import * as DynamicXml from './dxml/language-model'
import * as RegEx from './regex/language-model'
import * as Sql from './sql/language-model'
import * as Css from './css/language-model'

export const AvailableLanguageModels = [
  new BlockLanguage(RegEx.BLOCK_LANGUAGE_DESCRIPTION),
  new BlockLanguage(DynamicXml.BLOCK_LANGUAGE_STATIC),
  new BlockLanguage(DynamicXml.BLOCK_LANGUAGE_DYNAMIC),
  new BlockLanguage(Sql.BLOCK_LANGUAGE_DESCRIPTION),
  new BlockLanguage(Css.BLOCK_LANGUAGE_DESCRIPTION)
]
