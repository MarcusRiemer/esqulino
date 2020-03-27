import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { GrammarListDescription } from '../../shared/syntaxtree';
import { ListGrammarDataService, MutateGrammarService } from '../../shared/serverdata';

@Component({
  selector: 'grammar-overview-selector',
  templateUrl: './templates/overview-grammar.html'
})

export class OverviewGrammarComponent implements AfterViewInit {
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

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.onChangeSort(false);
      this.onChangePagination(this._paginator.pageSize, this._paginator.pageIndex);
    }, 100);
  }

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
  onChangePagination(pageSize: number, pageIndex: number) {
    this._list.setListPagination(pageSize, pageIndex, true);
  }

  /**
   * User has requested different sorting options
   */
  onChangeSort(refresh: boolean = true) {
    this._list.setListOrdering(this._sort.active as any, this._sort.direction, refresh);
  }

  displayedColumns: (keyof (GrammarListDescription) | "actions")[] = ["name", "slug", "id", "actions"];

}
