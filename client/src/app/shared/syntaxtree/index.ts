export * from './syntaxtree'
export * from './coderesource'
export * from './language'
export * from './language.description'
export * from './validator'
export * from './validator.description'

import { prettyPrintGrammar } from './prettyprint'

export { prettyPrintGrammar }

import { Language } from './language'
import * as Sql from './sql'
import * as DynamicXml from './dxml'
import * as RegEx from './regex'

/**
 * All languages that are statically known to the system.
 */
export const AvailableLanguages = {
  Sql: new Language(Sql.LANGUAGE_DESCRIPTION),
  DXmlLiquid: new Language(DynamicXml.LANGUAGE_DESCRIPTION_LIQUID),
  DXmlERuby: new Language(DynamicXml.LANGUAGE_DESCRIPTION_ERUBY),
  RegEx: new Language(RegEx.LANGUAGE_DESCRIPTION)
};





