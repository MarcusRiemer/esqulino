import { Component, EventEmitter, Output, Input } from "@angular/core";
import { AdminMetaCodeResourcesGQL } from "../../../generated/graphql";
import { map } from "rxjs/operators";
import { BehaviorSubject, combineLatest } from "rxjs";

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

  private readonly metaCodeResourcesQuery$ = this._metaCodeResourcesGQL.watch({
    programmingLanguageId: "meta-grammar",
  });

  /**
   * The code resources that are available.
   */
  readonly metaCodeResources$ = this.metaCodeResourcesQuery$.valueChanges.pipe(
    map((response) => response.data.codeResources.nodes)
  );

  private _selectedCodeResourceId = new BehaviorSubject<string>(undefined);

  /**
   * The code resource that is currently selected
   */
  readonly selectedCodeResource$ = combineLatest([
    this._selectedCodeResourceId,
    this.metaCodeResources$,
  ]).pipe(
    map(([selectedId, availabe]) => availabe.find((c) => c.id == selectedId))
  );

  /**
   * @return The code resource id that is currently set
   */
  @Input()
  get selectedCodeResourceId() {
    return this._selectedCodeResourceId.value;
  }

  /**
   * Changes the selected code resource id and informs listeners.
   */
  set selectedCodeResourceId(val: string) {
    this._selectedCodeResourceId.next(val);
    this.selectedCodeResourceIdChange.emit(val);
  }
}
