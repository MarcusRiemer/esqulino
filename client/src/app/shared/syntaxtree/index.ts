export * from './syntaxtree'
export * from './coderesource'
export * from './language'
export * from './language.description'
export * from './validator'
export * from './validator.description'

import { Language } from './language'
import * as Sql from './sql'
import * as Xml from './xml'
import * as RegEx from './regex'

/**
 * All languages that are statically known to the system.
 */
export const AvailableLanguages = {
  Sql: new Language(Sql.LANGUAGE_DESCRIPTION),
  Xml: new Language(Xml.LANGUAGE_DESCRIPTION),
  RegEx: new Language(RegEx.LANGUAGE_DESCRIPTION),
  All: new Language({
    id: "all",
    name: "All Languages",
    generators: [
      ...Xml.LANGUAGE_DESCRIPTION.generators,
      ...Sql.LANGUAGE_DESCRIPTION.generators,
      ...RegEx.LANGUAGE_DESCRIPTION.generators,
    ],
    validators: [
      ...Xml.LANGUAGE_DESCRIPTION.validators,
      ...Sql.LANGUAGE_DESCRIPTION.validators,
      ...RegEx.LANGUAGE_DESCRIPTION.validators,
    ]
  })
};





