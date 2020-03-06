import { Component, ViewChild } from '@angular/core';
import { GrammarDataService } from '../../shared/serverdata';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { GrammarDescription, GrammarListDescription } from '../../shared/syntaxtree';
import { Observable } from 'rxjs';

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
    private _serverData: GrammarDataService
  ) { }

availableGrammars: Observable<GrammarListDescription[]> = this._serverData.list;

resultsLength = this._serverData.listTotalCount;



  public deleteGrammar(id: string) {
    this._serverData.deleteSingle(id);
  }

  /**
   * User has requested a different chunk of data
   */
  onChangePagination() {
    this._serverData.setListPagination(this._paginator.pageSize, this._paginator.pageIndex);
  }

  /**
   * User has requested different sorting options
   */
  onChangeSort() {
    this._serverData.setListOrdering(this._sort.active, this._sort.direction);
  }

  displayedColumns = ["name", "slug", "id","actions"];

}
