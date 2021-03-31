import { Component, Input } from "@angular/core";
import { of } from "rxjs";
import { map } from "rxjs/operators";

import { Project, ProjectService } from "./project.service";

@Component({
  templateUrl: "templates/navbar.html",
  selector: "editor-navbar",
})
export class NavbarComponent {
  constructor(private _projectService: ProjectService) {}

  readonly hasDatabase$ = this._projectService.activeProject.pipe(
    map((p) => !!p.currentDatabaseName)
  );

  readonly imagesEnabled$ = of(false);

  /**
   * The currently edited project
   */
  @Input() project: Project;

  /**
   * @return The name of the database that is currently in use
   */
  get currentDatabaseName() {
    if (this.project) {
      return this.project.currentDatabaseName;
    }
  }
}
