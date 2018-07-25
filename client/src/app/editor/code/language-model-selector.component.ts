import { Component, Input } from '@angular/core';

import { map } from 'rxjs/operators';

import { CodeResource } from '../../shared/syntaxtree';

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
  ) {
  }

  /**
   * @return All available language models
   */
  get availableBlockLanguages() {
    return (this._currentCodeResource.currentResource.pipe(map(c => c.project.projectBlockLanguages)));
  }

  /**
   * @return The ID of the currently selected language
   */
  @Input()
  get selectedBlockLanguageId() {
    return (this.codeResource.blockLanguageIdPeek);
  }

  /**
   * Sets the ID of the new language and broadcasts the change.
   */
  set selectedBlockLanguageId(id: string) {
    this.codeResource.setBlockLanguageId(id);
  }

}
