import {Component, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {IdentifiableResourceDescription} from "../resource.description";
import {Observable} from "rxjs";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {SortDirection} from "@angular/material/sort/sort-direction";

export interface PaginationEvent {
  pageSize: number
  pageIndex: number
}

export interface SortEvent {
  active: string
  direction: SortDirection
}

@Component({
  selector: 'app-table-paginator',
  templateUrl: "./templates/paginator-table.html"
})
export class PaginatorTableComponent<TData extends IdentifiableResourceDescription> {

  // Angular Material UI to paginate
  @ViewChild(MatPaginator, {static: false})
  _paginator: MatPaginator;

  // Angular Material UI to sort by different columns
  @ViewChild(MatSort,{ static: false })
  _sort:MatSort

  @Input()
  resultsLength$: Observable<number>;

  @Input()
  availableGrammars$: Observable<TData[]>;

  @Input()
  displayedColumns: string[];

  @Output()
  pageEvent: EventEmitter<PaginationEvent> = new EventEmitter<PaginationEvent>();

  @Output()
  sortEvent: EventEmitter<SortEvent> = new EventEmitter<SortEvent>();

  constructor() {
  }

  onChangeSort() {
    this.sortEvent.emit({active: this._sort.active, direction: this._sort.direction});
  }

  onChangePagination() {
    this.pageEvent.emit({pageSize: this._paginator.pageSize, pageIndex: this._paginator.pageIndex});
  }
}