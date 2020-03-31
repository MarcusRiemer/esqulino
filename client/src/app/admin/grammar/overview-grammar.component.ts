import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { SortDirection } from "@angular/material/sort/sort-direction";
import { MatSort } from "@angular/material/sort";

import { GrammarListDescription } from "../../shared/syntaxtree";
import {
  ListGrammarDataService,
  MutateGrammarService,
} from "../../shared/serverdata";
import { PaginationEvent } from "../../shared/table/paginator-table.component";

@Component({
  selector: "grammar-overview-selector",
  templateUrl: "./templates/overview-grammar.html",
  providers: [ListGrammarDataService],
})
export class OverviewGrammarComponent {
  // Angular Material UI to sort by different columns
  @ViewChild(MatSort)
  _sort: MatSort;

  readonly resultsLength$ = this.grammars.listTotalCount$;
  readonly availableGrammars$ = this.grammars.list;
  readonly inProgress = this.grammars.listCache.inProgress;

  constructor(
    readonly grammars: ListGrammarDataService,
    private _mutate: MutateGrammarService
  ) {}

  async onDeleteGrammar(id: string) {
    await this._mutate.deleteSingle(id);
  }

  /**
   * User wants to see a refreshed dataset.
   */
  onRefresh() {
    this.grammars.listCache.refresh();
  }

  /**
   * User has requested different sorting options
   */
  onChangeSort(active: any, direction: SortDirection, refresh: boolean = true) {
    this.grammars.setListOrdering(active, direction, refresh);
  }

  displayedColumns: (keyof GrammarListDescription | "actions")[] = [
    "name",
    "slug",
    "id",
    "actions",
  ];
}
