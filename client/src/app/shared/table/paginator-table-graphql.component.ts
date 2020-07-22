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
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { SortDirection, MatSort } from "@angular/material/sort";
import { MatTable, MatColumnDef } from "@angular/material/table";

import { BehaviorSubject, combineLatest, Observable, Subscription } from "rxjs";
import { QueryRef } from "apollo-angular";
import { PageInfo } from "../../../generated/graphql";
import { map, startWith, tap } from "rxjs/operators";
import { ApolloQueryResult } from "apollo-client";

export interface GraphQLQueryData<
  QueryItem,
  QueryVariables,
  DataKey,
  ColumnName
> {
  query: QueryRef<QueryItem, QueryVariables>;
  dataKey: DataKey;
  displayColumns: ColumnName[];
  pageSize: number;
  sort: MatSort;
  filterColumns?: ColumnName[];
  filterString$?: BehaviorSubject<string>;
}

export interface GraphQLQueryComponent<
  QueryItem,
  QueryVariables,
  DataKey,
  ColumnName
> {
  readonly queryData: GraphQLQueryData<
    QueryItem,
    QueryVariables,
    DataKey,
    ColumnName
  >;
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
  queryData: GraphQLQueryData<{ __typename: String }, unknown, string, string>;

  private _subscriptions: Subscription[] = [];

  //response which can be subscribed once
  private _response$: Observable<ApolloQueryResult<any>>;
  //projects list (data type looks horrible)
  data$: Observable<{ pageInfo: PageInfo; totalCount: number; nodes: any[] }>;

  listData$: Observable<any>;
  //loading indicator for conditionalDisplay directive
  progress$: Observable<boolean>;
  //Mat-Paginator Info
  totalCount$: Observable<number>;

  private _pageSize: number;

  constructor() {}

  ngOnInit(): void {
    this._response$ = this.queryData.query.valueChanges;
    this.progress$ = this._response$.pipe(
      map((responseDocument) => responseDocument.loading)
    );
    this.data$ = this._response$.pipe(
      map((responseDocument) => responseDocument.data[this.queryData.dataKey])
    );
    this.totalCount$ = this.data$.pipe(map((data) => data.totalCount));
    // if filterString$ and filterColumns are provided, each row in the table will be filtered
    // by combining the response data with the filterString and filtering the response by filtercolumns
    if (this.queryData.filterString$ && this.queryData.filterColumns) {
      this.listData$ = combineLatest(
        this.data$.pipe(map((data) => data.nodes)),
        this.queryData.filterString$
      ).pipe(
        map(([nodes, filter]) =>
          nodes.filter((node) =>
            this.queryData.filterColumns.some((col) =>
              JSON.stringify(node[col])
                .toLowerCase()
                .includes(filter.toLowerCase())
            )
          )
        )
      );
    } else {
      this.listData$ = this.data$.pipe(map((data) => data.nodes));
    }
    this._pageSize = this.queryData.pageSize;
  }

  // Register the projected column definitions with the table renderer
  // Found at: https://stackoverflow.com/questions/53335929/
  ngAfterContentInit(): void {
    this.columnDefs.forEach((columnDef) => this._table.addColumnDef(columnDef));
  }

  ngAfterViewInit() {
    // Try to register the parents `sortChange` event. Inspired by
    // https://github.com/angular/components/issues/10446
    const sortSub = this.queryData.sort.sortChange.subscribe(() => {
      this.onChangeSort(
        this.queryData.sort.active,
        this.queryData.sort.direction
      );
    });
    this._subscriptions.push(sortSub);
  }

  ngOnDestroy() {
    this._subscriptions.forEach((s) => s.unsubscribe());
    this._subscriptions = [];
  }

  onChangePagination($event: PageEvent) {
    //PageSize Change
    const pageInfo: PageInfo = this.getPageInfo();
    if (this._pageSize != $event.pageSize) {
      this._pageSize = $event.pageSize;
      this.queryData.query.setVariables({ first: $event.pageSize });
    }
    //Next Page
    else if ($event.previousPageIndex < $event.pageIndex) {
      this.queryData.query.setVariables({
        first: $event.pageSize,
        after: pageInfo.endCursor,
      });
    }
    //Previous Page
    else {
      this.queryData.query.setVariables({
        last: $event.pageSize,
        before: pageInfo.startCursor,
      });
    }
  }

  /**
   * User has requested different sorting options
   */
  onChangeSort(active: string, direction: SortDirection) {
    //const pageInfo: PageInfo = this.getPageInfo();
    if (direction != "") {
      this.queryData.query.setVariables({
        first: this._pageSize,
        // after: btoa((+atob(pageInfo.startCursor) - 1).toString()),
        input: { order: { orderField: active, orderDirection: direction } },
      });
    }
  }

  getPageInfo(): PageInfo {
    return this.queryData.query.currentResult().data[this.queryData.dataKey]
      .pageInfo;
  }
}
