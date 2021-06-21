import { Component, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";

import {
  ListUserProjectsGQL,
  ListUserProjectsQuery,
  ListUserProjectsQueryVariables,
} from "../../generated/graphql";
import { GraphQLQueryComponent } from "../shared/table/paginator-table-graphql.component";

import { UserService } from "../shared/auth/user.service";

type DataKey = Exclude<keyof ListUserProjectsQuery, "__typename">;
type ListItem = ListUserProjectsQuery[DataKey]["nodes"][0];
type ColumnName = keyof ListItem;

/**
 * Displays all projects that somehow belong to the current user
 */
@Component({
  templateUrl: "./own-projects-overview.component.html",
})
export class OwnProjectsOverviewComponent
  implements
    GraphQLQueryComponent<
      ListUserProjectsQuery,
      ListUserProjectsQueryVariables,
      DataKey,
      ColumnName
    >
{
  // Angular Material UI to paginate
  @ViewChild(MatPaginator)
  _paginator: MatPaginator;

  // Angular Material UI to sort by different columns
  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  constructor(
    readonly userService: UserService,
    readonly projectList: ListUserProjectsGQL
  ) {
    // TODO: It seems rather unpleasant to set the variable in here
    //       as a side effect, there probably is a nicer way to do this.
    //       Possible root problem: `this.query` must be a plain value.
    this.userService.userId$.subscribe((userId) => {
      this.query.setVariables({ userId });
    });
  }

  typed(doc: any): ListItem {
    return doc as ListItem;
  }

  readonly dataKey: DataKey = "projects";

  // mat-pagination info
  pageSize: number = 25;

  // Query Object which can be used to refetch data
  // fetchPolicy must be network-only, to get a clean pagination
  readonly query = this.projectList.watch(
    { first: this.pageSize },
    { notifyOnNetworkStatusChange: true, fetchPolicy: "network-only" }
  );

  readonly displayedColumns: ColumnName[] = ["name", "slug", "createdAt"];

  get queryData() {
    return {
      query: this.query,
      dataKey: this.dataKey,
      displayColumns: this.displayedColumns,
      pageSize: this.pageSize,
      sort: this.sort,
    };
  }
}
