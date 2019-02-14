export * from './syntaxtree'
export * from './coderesource'
export * from './grammar'
export * from './language'
export * from './validator'
export * from './grammar.description'
export * from './validation-result'

export { prettyPrintGrammar } from './prettyprint'

import { Language } from './language'
import * as Sql from './sql'
import * as DynamicXml from './dxml'
import * as RegEx from './regex'
import * as Css from './css'
import * as Json from './json'
import * as Truck from './truck'

/**
 * All languages that are statically known to the system.
 */
export const AvailableLanguages = {
  Sql: new Language(Sql.LANGUAGE_DESCRIPTION),
  DXmlLiquid: new Language(DynamicXml.LANGUAGE_DESCRIPTION_LIQUID),
  DXmlERuby: new Language(DynamicXml.LANGUAGE_DESCRIPTION_ERUBY),
  RegEx: new Language(RegEx.LANGUAGE_DESCRIPTION),
  Css: new Language(Css.LANGUAGE_DESCRIPTION),
  Json: new Language(Json.LANGUAGE_DESCRIPTION),
  TruckWorld: new Language(Truck.WORLD_LANGUAGE_DESCRIPTION),
  TruckLanguage: new Language(Truck.PROG_LANGUAGE_DESCRIPTION)
};
