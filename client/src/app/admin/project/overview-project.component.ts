import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

import { Observable } from "rxjs";

import { AdminListProjectDataService } from "../../shared/serverdata";
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
export class OverviewProjectComponent implements AfterViewInit {
  // Angular Material UI to paginate
  @ViewChild(MatPaginator)
  _paginator: MatPaginator;

  // Angular Material UI to sort by different columns
  @ViewChild(MatSort)
  _sort: MatSort;

  constructor(private _list: AdminListProjectDataService) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.onChangeSort(false);
      this.onChangePagination();
    }, 100);
  }

  readonly availableProjects = this._list.list;
  readonly resultsLength$ = this._list.listTotalCount;

  /**
   * User has requested a different chunk of data
   */
  onChangePagination(refresh: boolean = true) {
    this._list.setListPagination(
      this._paginator.pageSize,
      this._paginator.pageIndex,
      refresh
    );
  }

  /**
   * User has requested different sorting options
   */
  onChangeSort(refresh: boolean = true) {
    if (ProjectListItemKey.guard(this._sort.active)) {
      this._list.setListOrdering(
        this._sort.active,
        this._sort.direction,
        refresh
      );
    }
  }

  displayedColumns: (keyof ProjectListDescription)[] = ["name", "slug", "id"];
}
