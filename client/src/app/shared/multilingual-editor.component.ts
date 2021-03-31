import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
} from "@angular/core";
import { CurrentLocaleService } from "../current-locale.service";

import { MultiLangString } from "./multilingual-string.description";

@Component({
  selector: "multilingual-editor",
  templateUrl: "./templates/multilingual-editor.html",
})
export class MultiLingualEditorComponent implements OnChanges {
  constructor(private readonly _lang: CurrentLocaleService) {}

  @Input() original: MultiLangString;
  @Input() translated: MultiLangString;
  @Input() control: string = "input";
  @Input() language: string = this._lang.localeId;
  @Input() placeholder: string = "";

  @Output() originalChange = new EventEmitter<MultiLangString>();
  @Output() translatedChange = new EventEmitter<MultiLangString>();

  ngOnChanges(changes: SimpleChanges) {
    if (!changes["original"].isFirstChange())
      this.originalChange.emit(this.original);

    if (!changes["translated"].isFirstChange())
      this.translatedChange.emit(this.translated);
  }
}
