import {
  Component,
  Input,
  Output,
  EventEmitter,
  LOCALE_ID,
  Inject,
  SimpleChanges,
  OnChanges,
} from "@angular/core";

import { MultilingualString } from "./multilingual-string.description";

@Component({
  selector: "multilingual-editor",
  templateUrl: "./templates/multilingual-editor.html",
})
export class MultiLingualEditorComponent implements OnChanges {
  @Input() original: MultilingualString;
  @Input() translated: MultilingualString;
  @Input() control: string = "input";
  @Input() language: string = this.localeID;
  @Input() placeholder: string = "";

  @Output() originalChange = new EventEmitter<MultilingualString>();
  @Output() translatedChange = new EventEmitter<MultilingualString>();

  constructor(@Inject(LOCALE_ID) readonly localeID: string) {}

  ngOnChanges(changes: SimpleChanges) {
    if (!changes["original"].isFirstChange())
      this.originalChange.emit(this.original);

    if (!changes["translated"].isFirstChange())
      this.translatedChange.emit(this.translated);
  }
}
