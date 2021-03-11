import { ActivatedRoute } from "@angular/router";
import { Component, Input, Output, EventEmitter } from "@angular/core";

import { locales } from "./change-language.component";
import { MultiLangString } from "./multilingual-string.description";
import { CurrentLocaleService } from "../current-locale.service";

@Component({
  selector: "multilingual-input",
  templateUrl: "./templates/multilingual-input.html",
})
export class MultiLingualInputComponent {
  constructor(
    private readonly _lang: CurrentLocaleService,
    private _activeRoute: ActivatedRoute
  ) {}

  @Input() language: string = this._lang.localeId;
  @Input() editingString: MultiLangString;
  @Input() control: string = "input";
  @Input() placeholder: string = "";

  @Output() editingStringChange = new EventEmitter<MultiLangString>();

  public readonly languages = locales;

  /**
   * Users may specify a mode via the URL
   */
  public readonly mode =
    this._activeRoute.snapshot.queryParamMap.get("mode") || "single";

  public get currentString(): string | undefined {
    return this.editingString?.[this.language];
  }

  public set currentString(val: string) {
    const changed = {};
    changed[this.language] = val;

    this.editingString = {
      ...this.editingString,
      ...changed,
    };
    this.editingStringChange.emit(this.editingString);
  }

  /**
   * Is there an Object with the selected language
   */
  public get isCurrentLanguageAvailable() {
    return this.editingString && this.language in this.editingString;
  }

  public get isTranslationTextarea() {
    return this.mode === "translation" && this.control === "textarea";
  }

  /**
   * Check if there is an Object needed
   */
  public get isNeedAnObject() {
    return (
      !this.currentString || this.currentString[this.language] == undefined
    );
  }

  /**
   * Add a new Object to the current String if there´s no one
   * and add an empty string to the current language
   */
  public addLanguage(newLang: string): void {
    if (!this.editingString) {
      this.editingString = {};
    }

    if (!(newLang in this.editingString)) {
      this.editingString[newLang] = "";
    }
  }

  /**
   * Deletes an entry of an object with the current language
   */
  public deleteLanguage(): void {
    const { [this.language]: _, ...remainingLanguages } = this.editingString;
    this.editingString = remainingLanguages;
  }
}
