import { Component } from "@angular/core";

import { FrontpageListProjectsGQL } from "../../generated/graphql";
import { map, tap } from "rxjs/operators";

/**
 * Lists all publicly available projects
 */
@Component({
  selector: "project-list",
  templateUrl: "templates/project-list.html",
})
export class ProjectListComponent {
  constructor(private _projectsGQL: FrontpageListProjectsGQL) {}

  readonly projects = this._projectsGQL
    .watch()
    .valueChanges.pipe(map((response) => response.data.projects.nodes));
}
