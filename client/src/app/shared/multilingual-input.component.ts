import { Component, Input, LOCALE_ID, Inject, Output, EventEmitter, OnInit} from '@angular/core';

import { locales } from './change-language.component'
import { MultilingualString } from './multilingual-string.description';

@Component({
  selector: 'multilingual-input',
  templateUrl: './templates/multilingual-input.html'
})
export class MultiLingualInputComponent {
  @Input() editingString: MultilingualString;
  @Output() editingStringChange = new EventEmitter<MultilingualString>();
  @Input() control: string = 'input';
  @Input() language: string = this.localeId;

  constructor(
    @Inject(LOCALE_ID) readonly localeId: string
  ) {}

  readonly languages = locales;

  get currentString() {
    return (this.editingString)
  }

  set currentString(val: MultilingualString) {
    this.editingString = val;
    this.editingStringChange.emit(this.editingString);
  }

  addObject(): void {
    if (!this.currentString)
      this.currentString = {};

    let newString = this.currentString;
    newString[this.language] = '';

    this.currentString = newString;
  }

  deleteObject(): void {
    delete this.currentString[this.language]
  }
}