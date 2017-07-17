import { Component } from '@angular/core'

import { ProjectService } from '../project.service'
import { Table } from '../../shared/schema'

/**
 * Shows available drag-operations for the table editor.
 */
@Component({
  templateUrl: 'templates/sidebar-controls.html',
  selector: "schema-editor-table-sidebar-controls"
})
export class TableEditorSidebarControlsComponent {
  public static get SIDEBAR_IDENTIFIER() { return "schema-table-editor-controls" };

  private _projectTables: Table[];

  public constructor(projectService: ProjectService) {
    projectService.activeProject
      .first()
      .subscribe(p => this._projectTables = p.schema.tables);
  }

  public get availableColumnTypes() {
    return ([
      "TEXT", "INTEGER", "FLOAT", "BOOLEAN", "URL"
    ]);
  }

  public get projectTables() {
    return (this._projectTables);
  }
}
