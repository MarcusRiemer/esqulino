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
  get availableLanguageModelNames() {
    return (this.availableLanguageModels.map(m => m.languageName));
  }

  /**
   * @param name The name of the language
   * @return The specific LanguageModel that was asked for.
   */
  getLanguageModel(name: string) {
    const m = Object.values(this.availableLanguageModels).find(lang => lang.languageName === name);
    if (m) {
      return (m);
    } else {
      const available = this.availableLanguageModelNames.join(', ');
      throw new Error(`Unknown language model "${name}", known models are: ${available}`)
    }
  }

}
