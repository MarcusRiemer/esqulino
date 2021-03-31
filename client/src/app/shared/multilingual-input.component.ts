import { ActivatedRoute } from "@angular/router";
import { Component, Input, Output, EventEmitter } from "@angular/core";

import { locales } from "./change-language.component";
import { MultiLangString } from "./multilingual-string.description";
import { CurrentLocaleService } from "../current-locale.service";
import produce from "immer";

@Component({
  selector: "multilingual-input",
  templateUrl: "./templates/multilingual-input.html",
  styleUrls: ["./multilingual-input.component.scss"],
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
    this.editingString = produce(this.editingString ?? {}, (edited) => {
      edited[this.language] = val;
    });

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
   * Add a new Object to the current String if there´s no one
   * and add an empty string to the current language
   */
  public addLanguage(newLang: string): void {
    this.editingString = produce(this.editingString ?? {}, (edited) => {
      edited[newLang] = "";
    });
  }

  /**
   * Deletes an entry of an object with the current language
   */
  public deleteLanguage(): void {
    const { [this.language]: _, ...remainingLanguages } = this.editingString;
    this.editingString = remainingLanguages;
  }
}
