import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CodeResource } from '../../shared/syntaxtree';
import { LanguageService } from '../../shared/language.service';

import { CurrentCodeResourceService } from '../current-coderesource.service';

/**
 * Provides a convenient way to select language models.
 */
@Component({
  templateUrl: 'templates/language-model-selector.html',
  selector: 'language-model-selector'
})
export class LanguageModelSelectorComponent {

  @Input() codeResource: CodeResource;

  constructor(
    private _currentCodeResource: CurrentCodeResourceService,
    private _languageService: LanguageService,
  ) {
  }

  /**
   * @return All available language models
   */
  get availableLanguageModels() {
    return (this._languageService.availableLanguageModels);
  }

  /**
   * @return The ID of the currently selected language
   */
  @Input()
  get selectedLanguageModelId() {
    return (this.codeResource.blockLanguageIdPeek);
  }

  /**
   * Sets the ID of the new language and broadcasts the change.
   */
  set selectedLanguageModelId(id: string) {
    this.codeResource.setBlockLanguageId(id);
  }

}
