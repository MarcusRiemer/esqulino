import { Injectable, Type } from '@angular/core'

import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'

import { AvailableLanguages } from '../../shared/syntaxtree'

/**
 * Groups together information about the state of the editor as a whole.
 */
@Injectable()
export class LanguageService {

  get availableLanguages() {
    return (AvailableLanguages);
  }

}
