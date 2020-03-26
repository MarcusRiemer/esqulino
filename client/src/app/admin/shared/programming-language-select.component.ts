import { Component, EventEmitter, Output, Input } from "@angular/core";

import { ListProgrammingLanguagesService } from './programming-language-list.service';

/**
 * Allows the selection of a single meta code resource (or none).
 */
@Component({
  templateUrl: `templates/programming-language-select.html`,
  selector: `programming-language-select`,
  providers: [
    ListProgrammingLanguagesService
  ]
})
export class ProgrammingLanguageSelectComponent {
  @Output()
  selectedIdChange = new EventEmitter<string>();

  constructor(
    private _list: ListProgrammingLanguagesService
  ) { }

  /**
   * The code resources that are available.
   */
  readonly programmingLanguages$ = this._list.programmingLanguages$;

  private _selectedId: string;

  /**
   * @return The code resource id that is currently set
   */
  @Input()
  get selectedId() {
    return (this._selectedId);
  }

  /**
   * Changes the selected code resource id and informs listeners.
   */
  set selectedId(val: string) {
    this._selectedId = val;
    this.selectedIdChange.emit(val);
  }
}