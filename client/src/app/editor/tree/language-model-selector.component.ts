import { Component, EventEmitter, Input, Output } from '@angular/core';

import { LanguageService } from './language.service';
import { TreeEditorService } from './editor.service';

/**
 * Provides a convenient way to select language models.
 */
@Component({
  templateUrl: 'templates/language-model-selector.html',
  selector: 'language-model-selector'
})
export class LanguageModelSelectorComponent {

  // Fired when the selected language changed
  @Output() selectedLanguageIdChange = new EventEmitter<string>();

  // Backing field for the selected language
  private _selectedLanguageId: string;

  constructor(
    private _treeService: TreeEditorService,
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
  get selectedLanguageId() {
    return (this._selectedLanguageId);
  }

  /**
   * Sets the ID of the new language and broadcasts the change.
   */
  set selectedLanguageId(id: string) {
    this._selectedLanguageId = id;
    this.selectedLanguageIdChange.emit(id);
  }

}
