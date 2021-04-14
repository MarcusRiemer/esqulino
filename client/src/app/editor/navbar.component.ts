import { Component } from "@angular/core";

import { of } from "rxjs";
import { map, shareReplay } from "rxjs/operators";
import { CodeResource } from "../shared";
import { tailorResourceReferences } from "../shared/syntaxtree/tailor-resource-references";

import { DragService } from "./drag.service";
import { ProjectService } from "./project.service";

@Component({
  templateUrl: "templates/navbar.html",
  selector: "editor-navbar",
})
export class NavbarComponent {
  constructor(
    private _projectService: ProjectService,
    private _dragService: DragService
  ) {}

  readonly hasDatabase$ = this._projectService.activeProject.pipe(
    map((p) => !!p.currentDatabaseName)
  );

  readonly currentDatabaseName$ = this._projectService.activeProject.pipe(
    map((p) => p.currentDatabaseName),
    shareReplay(1)
  );

  readonly imagesEnabled$ = of(false);

  readonly project$ = this._projectService.activeProject;

  /**
   * The user has decided to start dragging something from the sidebar.
   */
  startResourceDrag(evt: DragEvent, c: CodeResource) {
    const tailoredNode = tailorResourceReferences(c.toModel());
    if (tailoredNode.length > 0) {
      this._dragService.dragStart(evt, tailoredNode);
    }
  }
}
