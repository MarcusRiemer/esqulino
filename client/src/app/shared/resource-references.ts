import { BlockLanguage } from "./block/block-language";
import { Validator } from './syntaxtree/validator';
import { Language } from './syntaxtree/language';

/**
 * As resources are sometimes heavily interleaved, a generic way to access those is required.
 * In earlier iterations this was the responsibility of the `Project` class, but this horribly
 * breaks down for resources that don't belong to a project. So this interface was born :)
 */
export interface ResourceReferences {
  /**
   * @param id The ID of the requested block language
   * @return The block language with the requested ID
   */
  getBlockLanguage(id: string): BlockLanguage;

  /**
   * @param programmingLanguageId The core language to use, may define static code validators
   * @param grammarId The grammar to verify against
   * @return A validator that checks for both kinds of errors
   */
  getValidator(programmingLanguageId: string, grammarId: string): Validator;

  /**
   * @param programmingLanguageId The id of the core language
   * @return The language as defined in the core, does not validate any grammar!
   */
  getCoreProgrammingLanguage(programmingLanguageId: string): Promise<Language>;
}