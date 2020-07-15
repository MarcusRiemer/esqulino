import { Component, EventEmitter, Output, Input } from "@angular/core";
import { AdminMetaCodeResourcesGQL } from "../../../generated/graphql";
import { map } from "rxjs/operators";

/**
 * Allows the selection of a single meta code resource (or none).
 */
@Component({
  templateUrl: `templates/meta-code-resource-select.html`,
  selector: `meta-code-resource-select`,
})
export class MetaCodeResourceSelectComponent {
  @Output()
  selectedCodeResourceIdChange = new EventEmitter<string>();

  constructor(private _metaCodeResourcesGQL: AdminMetaCodeResourcesGQL) {}

  /**
   * The code resources that are available.
   */
  readonly metaCodeResources$ = this._metaCodeResourcesGQL
    .watch({ programmingLanguageId: "meta-grammar" })
    .valueChanges.pipe(map((respone) => respone.data.codeResources.nodes));

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
