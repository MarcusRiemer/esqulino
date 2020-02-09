import { Injectable } from '@angular/core';

import { ResourceReferences } from './resource-references';
import { LanguageService } from './language.service';
import { BlockLanguageDataService, GrammarDataService } from './serverdata';
import { BlockLanguage } from './block';
import { Validator } from './syntaxtree/validator';

/**
 * Provides access to the most recent state of all resources that are loaded.
 */
@Injectable({
  providedIn: 'root'
})
export class ResourceReferencesService implements ResourceReferences {
  private _blockLanguages: { [blockLanguageId: string]: BlockLanguage } = {};

  constructor(
    private _languageService: LanguageService,
    private _blockLanguageData: BlockLanguageDataService,
    private _grammarLanguageData: GrammarDataService,
  ) { }

  getBlockLanguage(id: string) {
    if (!this._blockLanguages[id]) {
      const desc = this._blockLanguageData.getLocal(id, "undefined");
      if (!desc) {
        debugger;
        throw new Error(`Could not construct block language "${id}" on the fly`);
      }

      const blockLanguage = new BlockLanguage(desc);
      this._blockLanguages[desc.id] = blockLanguage;
    }

    return (this._blockLanguages[id]);
  }

  getValidator(programmingLanguageId: string, grammarId: string) {
    const programmingLanguage = this._languageService.getLanguage(programmingLanguageId);
    const specializedValidators = programmingLanguage.validator.specializedValidators;
    const grammarDescription = this._grammarLanguageData.getLocal(grammarId, "undefined");
    if (!grammarDescription) {
      throw new Error(`Could not construct validator for "${programmingLanguageId}" with grammar ${grammarId} on the fly: Grammar missing`);
    }

    const validator = new Validator([grammarDescription, ...specializedValidators]);

    return (validator);
  }

  async getCoreProgrammingLanguage(programmingLanguageId: string) {
    return this._languageService.getLanguage(programmingLanguageId);
  }
}