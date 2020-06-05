import { Component, EventEmitter, Output, Input } from "@angular/core";

import { ListGrammarDataService } from "../../shared/serverdata";

/**
 * Allows the selection of a single meta code resource (or none).
 */
@Component({
  templateUrl: `templates/grammar-select.html`,
  selector: `grammar-select`,
})
export class GrammarSelectComponent {
  @Output()
  selectedIdChange = new EventEmitter<string>();

  constructor(private _list: ListGrammarDataService) {}

  /**
   * The code resources that are available.
   */
  readonly grammars$ = this._list.list;

  private _selectedId: string;

  /**
   * @return The code resource id that is currently set
   */
  @Input()
  get selectedId() {
    return this._selectedId;
  }

  /**
   * Changes the selected code resource id and informs listeners.
   */
  set selectedId(val: string) {
    this._selectedId = val != "" ? val : undefined;
    this.selectedIdChange.emit(val);
  }
}
