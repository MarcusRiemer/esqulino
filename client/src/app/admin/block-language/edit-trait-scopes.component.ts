import { Component, Input } from '@angular/core'

import { BlockLanguageDescription } from '../../shared/block/block-language.description'

/**
 * Allows editing the scope of all traits that are available on a specific block
 * language.
 */
@Component({
  templateUrl: 'templates/edit-trait-scopes.html',
  selector: 'edit-trait-scopes'
})
export class EditTraitScopesComponent {
  @Input() blockLanguage: BlockLanguageDescription;

  get availableScopes() {
    if (this.blockLanguage
      && this.blockLanguage.localGeneratorInstructions
      && this.blockLanguage.localGeneratorInstructions.traitScopes) {
      return (this.blockLanguage.localGeneratorInstructions.traitScopes);
    } else {
      return ([]);
    }
  }

  /**
   * Adds a new, empty trait scope to the current list of applied
   * trait scopes.
   */
  addEmptyScope() {
    if (this.blockLanguage) {
      const instructions = this.blockLanguage.localGeneratorInstructions || {};
      if (!instructions.traitScopes) {
        instructions.traitScopes = [];
      }

      instructions.traitScopes.push({
        traits: []
      });
    }
  }
}
