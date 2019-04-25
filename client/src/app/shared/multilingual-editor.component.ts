import { Component, Input, Output, EventEmitter, LOCALE_ID, Inject, SimpleChanges, OnChanges } from "@angular/core";

import { MultilingualString } from './multilingual-string.description';

@Component({
  selector: 'multilingual-editor',
  templateUrl: './templates/multilingual-editor.html'
})
export class MultiLingualEditorComponent implements OnChanges {
  @Input() firstString: MultilingualString;
  @Input() secondString: MultilingualString;
  @Output() firstStringChange = new EventEmitter<MultilingualString>();
  @Output() secondStringChange = new EventEmitter<MultilingualString>();
  @Input() control: string = 'input';
  @Input() language: string = this.localeID;

  constructor(
    @Inject(LOCALE_ID) readonly localeID: string
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['firstString'].isFirstChange())
      this.firstStringChange.emit(this.firstString);

    if (!changes['secondString'].isFirstChange())
      this.secondStringChange.emit(this.secondString);
  }
}