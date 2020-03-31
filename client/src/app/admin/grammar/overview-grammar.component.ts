import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { SortDirection } from "@angular/material/sort/sort-direction";

import { GrammarListDescription } from "../../shared/syntaxtree";
import {
  ListGrammarDataService,
  MutateGrammarService,
} from "../../shared/serverdata";
import { PaginationEvent } from "../../shared/table/paginator-table.component";
import { MatSort } from "@angular/material/sort";

@Component({
  selector: "grammar-overview-selector",
  templateUrl: "./templates/overview-grammar.html",
  providers: [ListGrammarDataService],
})
export class OverviewGrammarComponent implements AfterViewInit {
  // Angular Material UI to sort by different columns
  @ViewChild(MatSort)
  _sort: MatSort;

  resultsLength$ = this._list.listTotalCount;
  readonly availableGrammars$ = this._list.list;
  readonly inProgress = this._list.listCache.inProgress;

  constructor(
    private _list: ListGrammarDataService,
    private _mutate: MutateGrammarService
  ) {}

  ngAfterViewInit() {
    this.onChangeSort(this._sort.active, this._sort.direction, false);
  }

  public deleteGrammar(id: string) {
    this._mutate.deleteSingle(id);
  }

  /**
   * User wants to see a refreshed dataset.
   */
  onRefresh() {
    this._list.listCache.refresh();
  }

  onPageEvent(event: PaginationEvent) {
    this.onChangePagination(event.pageSize, event.pageIndex);
  }

  /**
   * User has requested a different chunk of data
   */
  onChangePagination(pageSize: number, pageIndex: number) {
    this._list.setListPagination(pageSize, pageIndex, true);
  }

  /**
   * User has requested different sorting options
   */
  onChangeSort(active: any, direction: SortDirection, refresh: boolean = true) {
    this._list.setListOrdering(active, direction, refresh);
  }

  displayedColumns: (keyof GrammarListDescription | "actions")[] = [
    "name",
    "slug",
    "id",
    "actions",
  ];
}
