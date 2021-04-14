import { Component, Input } from "@angular/core";
import { of } from "rxjs";
import { map, shareReplay } from "rxjs/operators";

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

  readonly currentDatabaseName$ = this._projectService.activeProject.pipe(
    map((p) => p.currentDatabaseName),
    shareReplay(1)
  );

  readonly imagesEnabled$ = of(false);

  /**
   * The currently edited project
   */
  readonly project$ = this._projectService.activeProject;
}
