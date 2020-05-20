import { Component } from "@angular/core";

import { ProjectService } from "../project.service";

/**
 * Shows available drag-operations for the table editor.
 */
@Component({
  templateUrl: "templates/sidebar-controls.html",
  selector: "schema-editor-table-sidebar-controls",
})
export class TableEditorSidebarControlsComponent {
  public static get SIDEBAR_IDENTIFIER() {
    return "schema-table-editor-controls";
  }

  public constructor(private _projectService: ProjectService) {}

  /**
   * @return A list of types that can be used by the user
   */
  public get availableColumnTypes() {
    return ["TEXT", "INTEGER", "FLOAT", "BOOLEAN", "URL"];
  }

  /**
   * @return All tables that are available
   */
  public get project() {
    return this._projectService.activeProject;
  }
}
