import { Injectable, Type } from '@angular/core'

import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'

import { AvailableLanguages } from '../../shared/syntaxtree'

/**
 * Groups together information about the state of the editor as a whole.
 */
@Injectable()
export class LanguageService {

  /**
   * @return All available languages
   */
  get availableLanguages() {
    return (AvailableLanguages);
  }

  /**
   * @param name The name of the language
   * @return The specific language that was asked for.
   */
  getLanguageByName(name: string) {
    return (Object.values(this.availableLanguages).find(lang => lang.name === name));
  }

}
