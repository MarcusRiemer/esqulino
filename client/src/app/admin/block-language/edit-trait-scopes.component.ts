import { Component, Input } from "@angular/core";

import { BlockLanguageDescription } from "../../shared/block/block-language.description";
import { DEFAULT_GENERATOR } from "../../shared/block/generator/generator.description";

/**
 * Allows editing the scope of all traits that are available on a specific block
 * language.
 */
@Component({
  templateUrl: "templates/edit-trait-scopes.html",
  selector: "edit-trait-scopes",
})
export class EditTraitScopesComponent {
  @Input() blockLanguage: BlockLanguageDescription;

  get availableScopes() {
    const instructions =
      this.blockLanguage && this.blockLanguage.localGeneratorInstructions;

    if (instructions && instructions.type === "manual") {
      return instructions.traitScopes;
    } else {
      return [];
    }
  }

  /**
   * Adds a new, empty trait scope to the current list of applied
   * trait scopes.
   */
  addEmptyScope() {
    if (this.blockLanguage) {
      const instructions =
        this.blockLanguage.localGeneratorInstructions || DEFAULT_GENERATOR;
      if (instructions.type === "manual" && !instructions.traitScopes) {
        instructions.traitScopes = [];

        instructions.traitScopes.push({
          traits: [],
        });
      }
    }
  }
}
