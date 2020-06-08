import {
  Component,
  Input,
  ViewChild,
  ContentChildren,
  QueryList,
  AfterContentInit,
  OnDestroy,
  AfterViewInit,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { SortDirection, MatSort } from "@angular/material/sort";
import { MatTable, MatColumnDef } from "@angular/material/table";

import { ListData } from "../serverdata";
import {BehaviorSubject, EMPTY, Observable, Subscription} from "rxjs";
import {QueryRef} from "apollo-angular";
import {PageInfo} from "../../../generated/graphql";
import {map} from "rxjs/operators";
import {ApolloQueryResult} from "apollo-client";

export interface PaginationEvent {
  pageSize: number;
  pageIndex: number;
}

@Component({
  selector: "app-table-paginator-graphql",
  templateUrl: "./templates/paginator-table-graphql.html",
})
export class PaginatorTableGraphqlComponent
  implements AfterContentInit, AfterViewInit, OnDestroy {
  // Angular Material UI to paginate
  @ViewChild(MatPaginator)
  private _paginator: MatPaginator;

  // The table instance that register the column definitions
  @ViewChild(MatTable, { static: true })
  private _table: MatTable<any>;

  // The column definitions that are passed in via ng-content
  @ContentChildren(MatColumnDef)
  columnDefs: QueryList<MatColumnDef>;

  @Input()
  dataKey:string;

  // The list that should be rendered
  @Input()
  query:QueryRef<any>;

  // The columns that should be rendered
  @Input()
  activeColumns: string[] = [];

  @Input()
  sort: MatSort;

  @Input()
  pageSize: number;

  // mat-pagination info
  pageIndex: number = 0;

  private _subscriptions: Subscription[] = [];

  //response which can be subscribed once
  private _response$:Observable<ApolloQueryResult<any>>;
  //projects list (data type looks horrible)
   data$:Observable<any>;
  //loading indicator for conditionalDisplay directive
   progress$:Observable<boolean>;
  //Mat-Paginator Info
   totalCount$: Observable<number>;
  //Information for relay pagination
   pageInfo:PageInfo;

  constructor() {}

  ngOnInit():void {
  this._response$ = this.query.valueChanges;
  this.data$ = this._response$.pipe(map(result => result.data[this.dataKey].nodes));
  this.progress$= this._response$.pipe(map(result => result.loading));
  this.totalCount$ = this._response$.pipe(map(result => result.data[this.dataKey].totalCount));
  const pageSub = this._response$.subscribe(result => this.pageInfo = result.data[this.dataKey].pageInfo);
    this._subscriptions.push(pageSub);
  }

  // Register the projected column definitions with the table renderer
  // Found at: https://stackoverflow.com/questions/53335929/
  ngAfterContentInit(): void {
    this.columnDefs.forEach((columnDef) => this._table.addColumnDef(columnDef));
  }

  ngAfterViewInit() {
    // Try to register the parents `sortChange` event. Inspired by
    // https://github.com/angular/components/issues/10446
    const sortSub = this.sort.sortChange.subscribe(() => {
      this.onChangeSort(this.sort.active, this.sort.direction);
    });
    this._subscriptions.push(sortSub);
  }

  ngOnDestroy() {
    this._subscriptions.forEach((s) => s.unsubscribe());
    this._subscriptions = [];
  }

  onChangePagination() {
    //PageSize Change
    let variables;
    if(this.pageSize != this._paginator.pageSize){
      variables = {first:this._paginator.pageSize}
    }
    //Next Page
    else if(this.pageIndex < this._paginator.pageIndex
      && this.pageInfo.hasNextPage){
      variables = {first: this._paginator.pageSize, after: this.pageInfo.endCursor}
    }
    //Previous Page
    else {
      variables = {last: this._paginator.pageSize, before: this.pageInfo.startCursor}
    }
    //refetches with new variables
    this.query.setVariables(variables);
    this.pageSize = this._paginator.pageSize;
    this.pageIndex = this._paginator.pageIndex;
  }

  /**
   * User has requested different sorting options
   */
  onChangeSort(
    active: string,
    direction: SortDirection,
    refresh: boolean = true
  ) {
    //this.listData.setListOrdering(active, direction, refresh);
  }
}
