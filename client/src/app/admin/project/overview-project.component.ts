import { Component, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material/sort";

import { GraphQLQueryComponent } from "../../shared/table/paginator-table-graphql.component";
import {
  AdminListProjectsGQL,
  AdminListProjectsQuery,
  AdminListProjectsQueryVariables,
} from "../../../generated/graphql";
import { MatPaginator } from "@angular/material/paginator";

// TODO: Should be beautified and used
type Query = ReturnType<AdminListProjectsGQL["watch"]>;

type DataKey = Exclude<keyof AdminListProjectsQuery, "__typename">;

// TODO: Resolve this from the Query type above, requires unpacking
//       a type argument to Observable
type ListItem = AdminListProjectsQuery[DataKey]["nodes"][0];

type ColumnName = keyof ListItem | "totalCount" | "userName";

/**
 *
 */
@Component({
  templateUrl: "./templates/overview-project.html",
})
export class OverviewProjectComponent
  implements
    GraphQLQueryComponent<
      AdminListProjectsQuery,
      AdminListProjectsQueryVariables,
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

  constructor(readonly projectsService: AdminListProjectsGQL) {}

  typed(doc: any): ListItem {
    return doc as ListItem;
  }

  readonly dataKey: DataKey = "projects";

  // mat-pagination info
  pageSize: number = 25;

  //Query Object which can be used to refetch data
  //fetchPolicy must be network-only, to get a clean pagination
  readonly query = this.projectsService.watch(
    { first: this.pageSize },
    { notifyOnNetworkStatusChange: true, fetchPolicy: "network-only" }
  );

  readonly displayedColumns: ColumnName[] = [
    "name",
    "slug",
    "totalCount",
    "id",
    "userName",
    "createdAt",
  ];

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
