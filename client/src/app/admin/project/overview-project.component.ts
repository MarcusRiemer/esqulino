import {Component, ViewChild} from "@angular/core";
import { MatSort } from "@angular/material/sort";

import { ProjectListDescription } from "../../shared/project.description";
import {
  AdminListProjectsGQL
} from "../../../generated/graphql";
import { MatPaginator } from "@angular/material/paginator";

/**
 *
 */
@Component({
  templateUrl: "./templates/overview-project.html",
})
export class OverviewProjectComponent{
  // Angular Material UI to paginate
  @ViewChild(MatPaginator)
  _paginator: MatPaginator;

  // Angular Material UI to sort by different columns
  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  constructor(readonly projectsService: AdminListProjectsGQL) {}

  // mat-pagination info
  pageSize: number = 25;

  //Query Object which can be used to refetch data
  //fetchPolicy must be network-only, to get a clean pagination
  readonly _query = this.projectsService.watch(
    { first:this.pageSize },
    { notifyOnNetworkStatusChange: true, fetchPolicy:"network-only" });

  readonly displayedColumns: (keyof ProjectListDescription)[] = ["name", "slug", "id"];
}
