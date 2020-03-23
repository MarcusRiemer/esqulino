import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { GrammarListDescription } from '../../shared/syntaxtree';
import { ListGrammarDataService, MutateGrammarService } from '../../shared/serverdata';
import {last} from "rxjs/operators";

@Component({
  selector: 'grammar-overview-selector',
  templateUrl: './templates/overview-grammar.html'
})

export class OverviewGrammarComponent {
  // Angular Material UI to paginate
  @ViewChild(MatPaginator)
  _paginator: MatPaginator;

  // Angular Material UI to sort by different columns
  @ViewChild(MatSort)
  _sort: MatSort;

  constructor(
    private _list: ListGrammarDataService,
    private _mutate: MutateGrammarService,
  ) { }

  resultsLength$ = this._list.listTotalCount;
  readonly availableGrammars = this._list.list;
  readonly inProgress = this._list.listCache.inProgress;

  public deleteGrammar(id: string) {
    this._mutate.deleteSingle(id);
  }

  /**
   * User wants to see a refreshed dataset.
   */
  onRefresh() {
    this._list.listCache.refresh();
  }

  /**
   * User has requested a different chunk of data
   */
  onChangePagination() {
    this._list.setListPagination(this._paginator.pageSize, this._paginator.pageIndex);
  }

  /**
   * User has requested different sorting options
   */
  onChangeSort() {
    this._list.setListOrdering(this._sort.active as any, this._sort.direction);
  }

  displayedColumns : (keyof(GrammarListDescription) | "actions" )[] = ["name", "slug", "id","actions"];

}
