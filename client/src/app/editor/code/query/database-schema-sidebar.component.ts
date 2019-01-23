import { Component, Inject } from '@angular/core'

import { CodeResource } from '../../../shared/syntaxtree';
import { Table, Column } from '../../../shared/schema';

import { SIDEBAR_MODEL_TOKEN } from '../../editor.token';

import { DragService } from '../../drag.service';

@Component({
  templateUrl: 'templates/database-schema-sidebar.html',
})
export class DatabaseSchemaSidebarComponent {
  constructor(
    @Inject(SIDEBAR_MODEL_TOKEN) private _codeResource: CodeResource,
    private _dragService: DragService
  ) {
  }

  /**
   * @return The tables that should be shown.
   */
  get possibleTables() {
    return (this._codeResource.project.schema.tables);
  }

  /**
   * @return The name of the current database
   */
  get databaseName() {
    return (this._codeResource.project.currentDatabaseName);
  }

  /**
   * The user has decided to start dragging something from the sidebar.
   */
  startTableDrag(evt: DragEvent, table: Table) {
    try {
      this._dragService.dragStart(evt, {
        language: "sql",
        name: "tableIntroduction",
        properties: {
          "name": table.name
        }
      });
    } catch (e) {
      alert(e);
    }
  }

  /**
   * The user has decided to start dragging something from the sidebar.
   */
  startColumnDrag(evt: DragEvent, table: Table, column: Column) {
    try {
      this._dragService.dragStart(evt, {
        language: "sql",
        name: "columnName",
        properties: {
          "columnName": column.name,
          "refTableName": table.name
        }
      });
    } catch (e) {
      alert(e);
    }
  }
}
