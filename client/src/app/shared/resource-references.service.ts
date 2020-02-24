import { Injectable } from '@angular/core';

import { BlockLanguage } from "./block/block-language";
import { Validator } from './syntaxtree/validator';
import { Language } from './syntaxtree/language';
import { StringUnion } from './string-union';
import { GrammarDescription } from './syntaxtree';

/**
 * Valid values for resources that may be required
 */
const RequiredResourceType = StringUnion(
  "blockLanguage", // A single block language
  "grammar", // A single grammar
  "blockLanguageGrammar" // A block language with its grammar
);

/**
 * Some type of resource that possibly must be available.
 */
export interface RequiredResource {
  type: typeof RequiredResourceType.type
  id: string
}

export function isRequiredResource(obj: any): obj is RequiredResource {
  return (
    typeof obj === "object"
    && typeof obj["id"] === "string"
    && RequiredResourceType.guard(obj["type"])
  );
}

/**
 * As resources are sometimes heavily interleaved, a generic way to access those is required.
 * In earlier iterations this was the responsibility of the `Project` class, but this horribly
 * breaks down for resources that don't belong to a project. So this interface was born :)
 */
@Injectable()
export abstract class ResourceReferencesService {
  /**
   * @param id The ID of the requested block language
   * @param onMissing What should be done in the case of a missing resource?
   * @return The block language with the requested ID
   */
  abstract getBlockLanguage(id: string, onMissing: "undefined" | "throw"): BlockLanguage;

  /**
   * @param id The ID of the requested grammar
   * @param onMissing What should be done in the case of a missing resource?
   * @return The grammar with the requested ID
   */
  protected abstract getGrammarDescription(id: string, onMissing: "undefined" | "throw"): GrammarDescription;

  /**
   * @param programmingLanguageId The core language to use, may define static code validators
   * @param grammarId The grammar to verify against
   * @return A validator that checks for both kinds of errors
   */
  getValidator(programmingLanguageId: string, grammarId: string) {
    const programmingLanguage = this.getCoreProgrammingLanguage(programmingLanguageId);
    const specializedValidators = programmingLanguage.validator.specializedValidators;
    const grammarDescription = this.getGrammarDescription(grammarId, "undefined");
    if (!grammarDescription) {
      throw new Error(`Could not construct validator for "${programmingLanguageId}" with grammar ${grammarId} on the fly: Grammar missing`);
    }

    const validator = new Validator([grammarDescription, ...specializedValidators]);

    return (validator);
  }

  /**
   * @param programmingLanguageId The id of the core language
   * @return The language as defined in the core, does not validate any grammar!
   */
  abstract getCoreProgrammingLanguage(programmingLanguageId: string): Language;

  /**
   * May be used to block until a certain set of resources is available.
   *
   * @param req All resources that must be available after the promise is fulfilled.
   */
  abstract ensureResources(req: RequiredResource[] | RequiredResource): Promise<boolean>;

  /**
   * May be used to check whether a certain set of resources is available.
   *
   * @param req All resources that must be available on the spot.
   */
  hasResources(req: RequiredResource[] | RequiredResource) {
    req = this.wrapRequired(req);
    return (
      req.every(r => {
        switch (r.type) {
          case "blockLanguage": return !!this.getBlockLanguage(r.id, "undefined");
          case "grammar": return !!this.getGrammarDescription(r.id, "undefined");
          case "blockLanguageGrammar": return this.hasBlockLanguageGrammar(r.id)
        }
      })
    );
  }

  /**
   * Helper method to check whether the block language and the referenced grammar are available
   */
  protected hasBlockLanguageGrammar(blockLanguageId: string) {
    const blockLang = this.getBlockLanguage(blockLanguageId, "undefined");
    if (!blockLang) {
      return (false);
    }

    return (this.hasResources({ type: "grammar", id: blockLang.grammarId }));
  }

  /**
   * Helper method to ensures that the block language and the referenced grammar are available
   */
  protected async ensureBlockLanguageGrammar(blockLanguageId: string) {
    const hasBlockLang = await this.ensureResources({ type: "blockLanguage", id: blockLanguageId });
    if (!hasBlockLang) {
      return (false);
    }
    // We know that the block language must exist, so we may as well throw
    const blockLang = this.getBlockLanguage(blockLanguageId, "throw");

    return (this.ensureResources({ type: "grammar", id: blockLang.grammarId }));
  }

  /**
   * Helper method to ensure that required resources are always an array.
   */
  protected wrapRequired(req: RequiredResource[] | RequiredResource) {
    if (isRequiredResource(req)) {
      return ([req]);
    } else {
      return (req);
    }
  }
}