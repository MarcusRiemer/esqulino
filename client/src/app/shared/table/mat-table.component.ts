import {AfterViewInit, Component, ContentChild, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";

import {Observable} from "rxjs";
import {IdentifiableResourceDescription} from "../resource.description";
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
  selector: 'app-table',
  templateUrl: "./templates/mat-table.html"
})
export class MatTableComponent<TData extends IdentifiableResourceDescription> implements AfterViewInit {
  // Angular Material UI to paginate
  @ViewChild(MatPaginator, {static: false})
  _paginator: MatPaginator;

  // Angular Material UI to sort by different columns
  @ViewChild(MatSort, {static: false})
  _sort: MatSort;

  @Input() dataSource$: Observable<TData[]>;
  @Input() inProgress$: Observable<boolean>;
  @Input() resultsLength$: Observable<number>;
  @Input() displayedColumns: string[];
  @Input() displayAsLink: String[];
  @Input() displayAsCode: String[];

  @Output() sortEvent: EventEmitter<SortEvent> = new EventEmitter<SortEvent>();
  @Output() pageEvent: EventEmitter<PaginationEvent> = new EventEmitter<PaginationEvent>();

  constructor() {
  }

  ngAfterViewInit(): void {
    this.onChangePagination();
    this.onChangeSort();
  }

  /**
   * User has requested a different chunk of data
   */
  onChangePagination() {
    this.pageEvent.emit({pageSize: this._paginator.pageSize, pageIndex: this._paginator.pageIndex});
  }

  /**
   * User has requested different sorting options
   */
  onChangeSort() {
    this.sortEvent.emit({active: this._sort.active, direction: this._sort.direction});
  }

  isLink(item: string){
    return this.displayAsLink ? this.displayAsLink.includes(item) : false;
  }

  isCode(item:string){
    return this.displayAsCode ? this.displayAsCode.includes(item) : false;
  }
}