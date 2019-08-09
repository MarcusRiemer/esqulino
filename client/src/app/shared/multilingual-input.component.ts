import { ActivatedRoute } from '@angular/router';
import { Component, Input, LOCALE_ID, Inject, Output, EventEmitter } from '@angular/core';

import { locales } from './change-language.component'
import { MultilingualString } from './multilingual-string.description';

@Component({
  selector: 'multilingual-input',
  templateUrl: './templates/multilingual-input.html'
})
export class MultiLingualInputComponent {
  @Input() editingString: MultilingualString;
  @Input() control: string = 'input';
  @Input() language: string = this.localeId;
  @Input() placeholder: string = '';

  @Output() editingStringChange = new EventEmitter<MultilingualString>();

  constructor(
    @Inject(LOCALE_ID) readonly localeId: string,
    private _activeRoute: ActivatedRoute
  ) { }

  public readonly languages = locales;

  // TODO: Read mode from URL? Or from somewhere else?
  public readonly mode: "single" | "translation" = 'single'

  public get currentString() {
    return (this.editingString)
  }

  /**
   * Is there an Object with the selected language
   */
  public get isCurrentLanguageAvailable() {
    return (this.currentString && this.currentString[this.language] != undefined)
  }

  public get isTranslationTextarea() {
    return (this.mode === 'translation' && this.control === 'textarea')
  }

  /**
   * Check if there is an Object needed
   */
  public get isNeedAnObject() {
    return (!this.currentString || this.currentString[this.language] == undefined)
  }

  public set currentString(val: MultilingualString) {
    this.editingString = val;
    this.editingStringChange.emit(this.editingString);
  }

  /**
   * Add a new Object to the current String if there´s no one
   * and add an empty string to the current language
   */
  public addObject(): void {
    if (!this.currentString)
      this.currentString = {};

    let newString = this.currentString;
    newString[this.language] = '';

    this.currentString = newString;
  }

  /**
   * Deletes an entry of an object with the current language
   */
  public deleteLanguage(): void {
    delete this.currentString[this.language]
  }
}