import {Component, ViewChild, OnInit} from "@angular/core";
import { MatSort } from "@angular/material/sort";

import { ProjectListDescription } from "../../shared/project.description";
import {
  AdminListProjectsGQL,
  AdminListProjectsQuery,
  CodeResourceConnection, Maybe,
  PageInfo,
  Project
} from "../../../generated/graphql";
import {MatPaginator, } from "@angular/material/paginator";
import {switchAll} from "rxjs/operators";
import {BehaviorSubject, EMPTY, Observable, } from "rxjs";
import {ApolloQueryResult} from "apollo-client";

/**
 *
 */
@Component({
  templateUrl: "./templates/overview-project.html",
})
export class OverviewProjectComponent implements OnInit{
  // Angular Material UI to paginate
  @ViewChild(MatPaginator)
  _paginator: MatPaginator;

  // Angular Material UI to sort by different columns
  @ViewChild(MatSort)
  _sort: MatSort;

  constructor(readonly projectsService: AdminListProjectsGQL) {}

  //response observer makes only one subscription possible
  private _queryObserver:BehaviorSubject<Observable<ApolloQueryResult<AdminListProjectsQuery>>> = new BehaviorSubject(EMPTY);
  //response which can be subscribed once
  private _response: Observable<ApolloQueryResult<AdminListProjectsQuery>>;
  //Information for relay pagination
  private _pageInfo:PageInfo;

  //projects list (data type looks horrible)
  projects:Maybe<Array<Maybe<{ __typename?: "Project" } & Pick<Project, "id" | "name" | "slug"> & { codeResources?: Maybe<{ __typename?: "CodeResourceConnection" } & Pick<CodeResourceConnection, "totalCount">> }>>>;

  //loading indicator for conditionalDisplay directive
  readonly progress = new BehaviorSubject<boolean>(true);

  //Mat-Paginator Info
  totalCount: number;
  pageSize: number = 25;
  pageIndex: number = 0;

  displayedColumns: (keyof ProjectListDescription)[] = ["name", "slug", "id"];

  ngOnInit(): void {
    this._queryObserver.next(this.projectsService.fetch(
      {first:this.pageSize}
    ));
    this._response = this._queryObserver.pipe(switchAll());
    this._response.subscribe(result => {
      this.progress.next(result.loading);
      this._pageInfo = result.data.projects.pageInfo;
      this.projects = result.data.projects.nodes;
      this.totalCount = result.data.projects.totalCount;
    });
  }

  onChangePagination() {
    //PageSize Change
    let variables;
    this.progress.next(true);
    if(this.pageSize != this._paginator.pageSize){
      variables = {first:this._paginator.pageSize}
    }
    //Next Page
    else if(this.pageIndex < this._paginator.pageIndex
      && this._pageInfo.hasNextPage){
      variables = {first:this._paginator.pageSize, after:this._pageInfo.endCursor}
    }
    //Previous Page
    else {
      variables = {last:this._paginator.pageSize, before:this._pageInfo.startCursor}
    }
    this._queryObserver.next(this.projectsService.fetch(variables));
    this.pageSize = this._paginator.pageSize;
    this.pageIndex = this._paginator.pageIndex;
  }
}
