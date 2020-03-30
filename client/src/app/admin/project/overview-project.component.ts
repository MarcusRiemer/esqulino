import { Component, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

import { Observable } from "rxjs";

import { AdminProjectDataService } from "../../shared/serverdata";
import { ProjectListDescription } from "../../shared/project.description";
import { StringUnion } from "../../shared/string-union";

const ProjectListItemKey = StringUnion("id", "slug", "name");
type ProjectListItemKey = typeof ProjectListItemKey.type;

/**
 *
 */
@Component({
  templateUrl: "./templates/overview-project.html",
})
export class OverviewProjectComponent {
  // Angular Material UI to paginate
  @ViewChild(MatPaginator)
  _paginator: MatPaginator;

  // Angular Material UI to sort by different columns
  @ViewChild(MatSort)
  _sort: MatSort;

  constructor(private _serverData: AdminProjectDataService) {}

  availableProjects: Observable<ProjectListDescription[]> = this._serverData
    .list;

  resultsLength = this._serverData.listTotalCount;

  /**
   * User has requested a different chunk of data
   */
  onChangePagination() {
    this._serverData.setListPagination(
      this._paginator.pageSize,
      this._paginator.pageIndex
    );
  }

  /**
   * User has requested different sorting options
   */
  onChangeSort() {
    if (ProjectListItemKey.guard(this._sort.active)) {
      this._serverData.setListOrdering(this._sort.active, this._sort.direction);
    }
  }

  displayedColumns: (keyof ProjectListDescription)[] = ["name", "slug", "id"];
}
