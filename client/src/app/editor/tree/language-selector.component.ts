import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CodeResource } from '../../shared/syntaxtree';
import { LanguageService } from '../../shared/language.service';

/**
 * Provides a convenient way to select languages.
 */
@Component({
  templateUrl: 'templates/language-selector.html',
  selector: 'language-selector'
})
export class LanguageSelectorComponent {

  @Input() codeResource: CodeResource;

  // Backing field for the selected language
  private _selectedLanguageId: string;

  constructor(
    private _languageService: LanguageService,
  ) {
  }

  /**
   * @return All available language models
   */
  get availableLanguages() {
    return (this._languageService.availableLanguages);
  }

  /**
   * @return The ID of the currently selected language
   */
  get selectedLanguageId() {
    return (this.codeResource.programmingLanguageIdPeek);
  }

  /**
   * Sets the ID of the new language and broadcasts the change.
   */
  set selectedLanguageId(id: string) {
    this.codeResource.setProgrammingLanguageId(id);
  }

}
