export * from './syntaxtree'
export * from './language'
export * from './validator'

import { Language } from './language'
import * as LanguageSql from './sql'
import * as LanguageXml from './xml'

/**
 * All languages that are statically known to the system.
 */
export const AvailableLanguages = {
  Sql: new Language({
    name: "sql",
    generators: LanguageSql.NODE_CONVERTER,
    validators: [LanguageSql.LANG_DESCRIPTION]
  }),

  Xml: new Language({
    name: "xml",
    generators: LanguageXml.NODE_CONVERTER,
    validators: [LanguageXml.LANG_DESCRIPTION]
  })
};





