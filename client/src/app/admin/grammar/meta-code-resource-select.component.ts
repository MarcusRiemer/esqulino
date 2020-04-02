import { Component, EventEmitter, Output, Input } from "@angular/core";

import { ListMetaCodeResourcesService } from "./meta-code-resource-list.service";

/**
 * Allows the selection of a single meta code resource (or none).
 */
@Component({
  templateUrl: `templates/meta-code-resource-select.html`,
  selector: `meta-code-resource-select`,
  providers: [ListMetaCodeResourcesService],
})
export class MetaCodeResourceSelectComponent {
  @Output()
  selectedCodeResourceIdChange = new EventEmitter<string>();

  constructor(private _list: ListMetaCodeResourcesService) {}

  /**
   * The code resources that are available.
   */
  readonly metaCodeResources$ = this._list.metaCodeResources.list;

  private _selectedCodeResourceId: string;

  /**
   * @return The code resource id that is currently set
   */
  @Input()
  get selectedCodeResourceId() {
    return this._selectedCodeResourceId;
  }

  /**
   * Changes the selected code resource id and informs listeners.
   */
  set selectedCodeResourceId(val: string) {
    this._selectedCodeResourceId = val;
    this.selectedCodeResourceIdChange.emit(val);
  }
}
