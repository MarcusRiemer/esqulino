export * from './syntaxtree'
export * from './coderesource'
export * from './language'
export * from './language.description'
export * from './validator'
export * from './validator.description'

import { Language } from './language'
import * as Sql from './sql'
import * as DynamicXml from './dxml'
import * as RegEx from './regex'

/**
 * All languages that are statically known to the system.
 */
export const AvailableLanguages = {
  Sql: new Language(Sql.LANGUAGE_DESCRIPTION),
  DXml: new Language(DynamicXml.LANGUAGE_DESCRIPTION),
  RegEx: new Language(RegEx.LANGUAGE_DESCRIPTION),
  All: new Language({
    id: "all",
    name: "All Languages",
    generators: [
      ...DynamicXml.LANGUAGE_DESCRIPTION.generators,
      ...Sql.LANGUAGE_DESCRIPTION.generators,
      ...RegEx.LANGUAGE_DESCRIPTION.generators,
    ],
    validators: [
      ...DynamicXml.LANGUAGE_DESCRIPTION.validators,
      ...Sql.LANGUAGE_DESCRIPTION.validators,
      ...RegEx.LANGUAGE_DESCRIPTION.validators,
    ]
  })
};





