import { Injectable, Type } from '@angular/core'
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'

import { AvailableLanguages, Language } from './syntaxtree'
import { AvailableLanguageModels, BlockLanguage } from './block'
import { ServerApiService } from 'app/shared';
import { BlockLanguageListDescription } from 'app/shared/block/block-language.description';

/**
 * Groups together information about languages that are available
 * as part of the compiled client.
 */
@Injectable()
export class LanguageService {

  /**
   * @return All languages that may be used to compile and validate code.
   */
  get availableLanguages(): ReadonlyArray<Language> {
    return (Object.values(AvailableLanguages));
  }

  /**
   * @return IDs of all available language models.
   */
  get availableLanguageIds() {
    return (this.availableLanguages.map(m => m.id));
  }

  /**
   * @param slug_or_id The slug of the language model
   * @return The specific LanguageModel that was asked for.
   */
  getLocalBlockLanguage(slug_or_id: string) {
    const toReturn = AvailableLanguageModels.find(l => l.id === slug_or_id || l.slug === slug_or_id);
    if (!toReturn) {
      throw new Error(`Unknown local block language "${slug_or_id}"`);
    }

    return (toReturn);
  }

  /**
   * @param id The id of the language
   * @return The specific Language that was asked for.
   */
  getLanguage(id: string) {
    const toReturn = this.availableLanguages.find(l => l.id === id);
    if (!toReturn) {
      const available = this.availableLanguageIds.join(', ');
      throw new Error(`Unknown language "${id}", known models are: ${available}`);
    }

    return (toReturn);
  }

}
