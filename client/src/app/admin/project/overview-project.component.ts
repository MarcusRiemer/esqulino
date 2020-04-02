import { Component, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material/sort";

import { AdminListProjectDataService } from "../../shared/serverdata";
import { ProjectListDescription } from "../../shared/project.description";

/**
 *
 */
@Component({
  templateUrl: "./templates/overview-project.html",
  providers: [AdminListProjectDataService],
})
export class OverviewProjectComponent {
  // Angular Material UI to sort by different columns
  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  constructor(readonly projects: AdminListProjectDataService) {}

  /**
   * User wants to see a refreshed dataset.
   */
  onRefresh() {
    this.projects.listCache.refresh();
  }

  displayedColumns: (keyof ProjectListDescription)[] = ["name", "slug", "id"];
}
