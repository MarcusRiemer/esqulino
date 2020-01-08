import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';

import { Observable, of as observableOf } from 'rxjs';

import { ProjectDataService } from '../../shared/serverdata';
import { ProjectListDescription } from '../../shared/project.description';

@Component({
  templateUrl: './templates/overview-project.html'
})

/**
 *
 */
export class OverviewProjectComponent {
  // Angular Material UI to paginate
  @ViewChild(MatPaginator, { static: false })
  _paginator: MatPaginator;

  // Angular Material UI to sort by different columns
  @ViewChild(MatSort, { static: false })
  _sort: MatSort;

  private _limit = 1;

  constructor(
    private _serverData: ProjectDataService
  ) { }

  availableProjects: Observable<ProjectListDescription[]> = this._serverData.list;

  resultsLength = observableOf(30);

  /**
   * User has requested a different chunk of data
   */
  onChangePagination() {
    this._serverData.setListPagination(this._limit++);
  }

  /**
   * User has requested different sorting options
   */
  onChangeSort() {
    this._serverData.setListOrdering(this._sort.active, this._sort.direction);
  }


  displayedColumns: (keyof ProjectListDescription)[] = ["id", "slug", "name"];
}
