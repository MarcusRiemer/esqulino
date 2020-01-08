import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';

import { map, switchMap } from 'rxjs/operators';
import { combineLatest, Observable, of as observableOf } from 'rxjs';

import { ProjectDataService } from '../../shared/serverdata';
import { ProjectListDescription } from '../../shared/project.description';
import { HttpParams } from '@angular/common/http';

@Component({
  templateUrl: './templates/overview-project.html'
})

/**
 *
 */
export class OverviewProjectComponent implements AfterViewInit {
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

  resultsLength = observableOf(0);

  ngAfterViewInit(): void {
    /*this.availableProjects = combineLatest(this._paginator.page, this._sort.sortChange).pipe(
      switchMap(() => this._serverData.list)
    );

    this.resultsLength = this.availableProjects.pipe(
      map(p => p.length)
    )*/
  }

  onChangeParams() {
    this._serverData.changeListParameters(new HttpParams().set("limit", (this._limit++).toString()));
  }

  onChangeSort() {
    let params = new HttpParams();

    if (this._sort.direction) {
      params = params.set("orderDirection", this._sort.direction)
        .set("orderField", this._sort.active);
    }

    this._serverData.changeListParameters(params);
  }


  displayedColumns: (keyof ProjectListDescription)[] = ["id", "slug", "name"];

}
