import {Component, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {IdentifiableResourceDescription} from "../resource.description";
import {Observable} from "rxjs";
import {MatPaginator} from "@angular/material/paginator";

export interface PaginationEvent {
  pageSize: number
  pageIndex: number
}

@Component({
  selector: 'app-table-paginator',
  templateUrl: "./templates/paginator-table.html"
})
export class PaginatorTableComponent<TData extends IdentifiableResourceDescription> {

  // Angular Material UI to paginate
  @ViewChild(MatPaginator, {static: false})
  _paginator: MatPaginator;

  @Input()
  resultsLength$: Observable<number>;

  @Output()
  pageEvent: EventEmitter<PaginationEvent> = new EventEmitter<PaginationEvent>();

  constructor() {
  }

  onChangePagination() {
    this.pageEvent.emit({pageSize: this._paginator.pageSize, pageIndex: this._paginator.pageIndex});
  }
}