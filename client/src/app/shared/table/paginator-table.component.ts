import {
  Component,
  Input,
  ViewChild,
  ContentChildren,
  QueryList,
  AfterContentInit,
  ContentChild,
  OnDestroy,
  AfterViewInit,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { SortDirection, MatSort } from '@angular/material/sort';
import { MatTable, MatColumnDef } from '@angular/material/table';

import { ListData } from "../serverdata";
import { Subscription } from 'rxjs';

export interface PaginationEvent {
  pageSize: number;
  pageIndex: number;
}

@Component({
  selector: "app-table-paginator",
  templateUrl: "./templates/paginator-table.html",
})
export class PaginatorTableComponent implements AfterContentInit, AfterViewInit, OnDestroy {
  // Angular Material UI to sort by different columns
  @ContentChild(MatSort)
  _sort: MatSort;

  // Angular Material UI to paginate
  @ViewChild(MatPaginator, { static: false })
  _paginator: MatPaginator;

  // The table instance that register the column definitions
  @ViewChild(MatTable, { static: true })
  table: MatTable<any>;

  // The column definitions that are passed in via ng-content
  @ContentChildren(MatColumnDef)
  columnDefs: QueryList<MatColumnDef>;

  // The list that should be rendered
  @Input()
  listData: ListData<any> = undefined;

  // The columns that should be rendered
  @Input()
  activeColumns: string[] = [];

  private _subscriptions: Subscription[] = [];

  constructor() { }

  // Register the projected column definitions with the table renderer
  // Found at: https://stackoverflow.com/questions/53335929/
  ngAfterContentInit(): void {
    this.columnDefs.forEach(columnDef => this.table.addColumnDef(columnDef));
  }

  ngAfterViewInit() {
    // Try to register the parents `sortChange` event. Inspired by
    // https://github.com/angular/components/issues/10446
    const sub = this._sort.sortChange.subscribe(() => {
      this.onChangeSort(this._sort.active, this._sort.direction);
    });
    this._subscriptions.push(sub);
  }

  ngOnDestroy() {
    this._subscriptions.forEach(s => s.unsubscribe());
    this._subscriptions = [];
  }

  get resultsLength$() {
    return this.listData.listTotalCount$;
  }

  onChangePagination() {
    this.listData.setListPagination(
      this._paginator.pageSize,
      this._paginator.pageIndex
    );
  }

  /**
   * User has requested different sorting options
   */
  onChangeSort(active: string, direction: SortDirection, refresh: boolean = true) {
    this.listData.setListOrdering(active, direction, refresh);
  }
}
