import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

import { GrammarListDescription } from '../../shared/syntaxtree';
import { ListGrammarDataService, MutateGrammarService } from '../../shared/serverdata';
import {Observable} from "rxjs";

@Component({
  selector: 'grammar-overview-selector',
  templateUrl: './templates/overview-grammar.html'
})

export class OverviewGrammarComponent implements AfterViewInit {
  // Angular Material UI to paginate
  @ViewChild(MatPaginator,{ static: false })
  _paginator : MatPaginator

  // Angular Material UI to sort by different columns
  @ViewChild(MatSort,{ static: false })
  _sort:MatSort

  dataSource = new MatTableDataSource<GrammarListDescription>();
  resultsLength$ = this._list.listTotalCount;
  readonly availableGrammars = this._list.list
  readonly inProgress = this._list.listCache.inProgress;

  constructor(
    private _list: ListGrammarDataService,
    private _mutate: MutateGrammarService,
  ) { }

  ngAfterViewInit(): void {
    console.log("entered afterviewinit()")
    this.availableGrammars.subscribe(data => {
        console.log("in afterviewinit() received data")
          if(data.length){
            this.dataSource.data = data;
            this.dataSource.paginator = this._paginator;
            this.dataSource.sort = this._sort;
            console.log("in afterviewinit() datasource:")
            console.log(this.dataSource)
            this.onChangeSort(false);
            this.onChangePagination(this.dataSource.paginator.pageSize,this.dataSource.paginator.pageIndex);
          }
        }, error => {console.log(error)}
    )
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
