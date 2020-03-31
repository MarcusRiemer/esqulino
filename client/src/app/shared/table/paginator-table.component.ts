import {AfterViewInit, Component, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {MatPaginator} from "@angular/material/paginator";

import {Observable} from "rxjs";

export interface PaginationEvent {
  pageSize: number
  pageIndex: number
}

@Component({
  selector: 'app-table-paginator',
  templateUrl: "./templates/paginator-table.html"
})
export class PaginatorTableComponent implements AfterViewInit{

  // Angular Material UI to paginate
  @ViewChild(MatPaginator, {static: false})
  _paginator: MatPaginator;

  @Input()
  resultsLength$: Observable<number>;

  @Output()
  pageEvent: EventEmitter<PaginationEvent> = new EventEmitter<PaginationEvent>();

  constructor() {
  }

  ngAfterViewInit() {
    this.onChangePagination();
  }

  onChangePagination() {
    this.pageEvent.emit({pageSize: this._paginator.pageSize, pageIndex: this._paginator.pageIndex});
  }
}