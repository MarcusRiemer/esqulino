export * from './syntaxtree'
export * from './language'
export * from './validator'

import { Language } from './language'
import * as LanguageSql from './sql'
import * as LanguageXml from './xml'

const LANG_SQL = new Language({
  name: "sql",
  generators: LanguageSql.NODE_CONVERTER,
  validators: [LanguageSql.LANG_DESCRIPTION]
});

const LANG_XML = new Language({
  name: "xml",
  generators: LanguageXml.NODE_CONVERTER,
  validators: [LanguageXml.LANG_DESCRIPTION]
});

/**
 * All languages that are statically known to the system.
 */
export const AvailableLanguages = {
  Sql: LANG_SQL,
  Xml: LANG_XML,
  All: new Language({
    name: "all",
    generators: [...LanguageXml.NODE_CONVERTER, ...LanguageSql.NODE_CONVERTER],
    validators: [LanguageXml.LANG_DESCRIPTION, LanguageSql.LANG_DESCRIPTION]
  })
};





