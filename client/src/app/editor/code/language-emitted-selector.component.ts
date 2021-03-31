import { Component, Input } from "@angular/core";

import { CodeResource } from "../../shared/syntaxtree";
import { LanguageService } from "../../shared/language.service";

/**
 * Provides a convenient way to select languages.
 */
@Component({
  templateUrl: "templates/language-selector.html",
  selector: "language-emitted-selector",
})
export class LanguageEmittedSelectorComponent {
  @Input() codeResource: CodeResource;

  constructor(private _languageService: LanguageService) {}

  /**
   * @return All available language models
   */
  get availableLanguages() {
    return this._languageService.availableLanguages;
  }

  /**
   * @return The ID of the currently selected language
   */
  get selectedLanguageId() {
    return this.codeResource.runtimeLanguageId;
  }

  /**
   * Sets the ID of the new language and broadcasts the change.
   */
  set selectedLanguageId(id: string) {
    this.codeResource.setRuntimeLanguageId(id);
  }
}
