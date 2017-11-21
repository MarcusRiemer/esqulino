import { Injectable, Type } from '@angular/core'

import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'

import { AvailableLanguages } from '../../shared/syntaxtree'
import { AvailableLanguageModels, LanguageModel } from '../../shared/block'

/**
 * Groups together information about available languages.
 */
@Injectable()
export class LanguageService {
  /**
   * @return All languages that are augmented for use with the UI
   */
  get availableLanguageModels() {
    return (AvailableLanguageModels);
  }

  /**
   * @return Names of all available language models.
   */
  get availableLanguageModelIds() {
    return (this.availableLanguageModels.map(m => m.id));
  }

  /**
   * @param name The id of the language
   * @return The specific LanguageModel that was asked for.
   */
  getLanguageModel(id: string) {
    const toReturn = Object.values(this.availableLanguageModels).find(lang => lang.id === id);
    if (!toReturn) {
      const available = this.availableLanguageModelIds.join(', ');
      throw new Error(`Unknown language model "${id}", known models are: ${available}`);
    }

    return (toReturn);
  }

}
