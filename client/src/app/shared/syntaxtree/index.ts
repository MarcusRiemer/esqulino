export * from './syntaxtree'
export * from './language'
export * from './language.description'
export * from './validator'
export * from './validator.description'

import { Language } from './language'
import * as Sql from './sql'
import * as Xml from './xml'

/**
 * All languages that are statically known to the system.
 */
export const AvailableLanguages = {
  Sql: new Language(Sql.LANGUAGE_DESCRIPTION),
  Xml: new Language(Xml.LANGUAGE_DESCRIPTION),
  All: new Language({
    name: "all",
    generators: [
      ...Xml.LANGUAGE_DESCRIPTION.generators,
      ...Sql.LANGUAGE_DESCRIPTION.generators,
    ],
    validators: [
      ...Xml.LANGUAGE_DESCRIPTION.validators,
      ...Sql.LANGUAGE_DESCRIPTION.validators,
    ]
  })
};





