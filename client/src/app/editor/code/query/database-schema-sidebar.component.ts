import { Component, Inject } from '@angular/core'

import { CodeResource, QualifiedTypeName } from '../../../shared/syntaxtree';
import { Table, Column } from '../../../shared/schema';

import { SIDEBAR_MODEL_TOKEN } from '../../editor.token';

import { DragService } from '../../drag.service';
import { SchemaService } from '../../schema.service';

@Component({
  templateUrl: 'templates/database-schema-sidebar.html',
})
export class DatabaseSchemaSidebarComponent {
  constructor(
    @Inject(SIDEBAR_MODEL_TOKEN)
    private _codeResource: CodeResource,
    private _dragService: DragService,
    private _schemaService: SchemaService
  ) {
  }

  /**
   * @return The tables that should be shown.
   */
  get possibleTables(): Table[] {
    return (this._schemaService.currentSchema.tables);
  }

  /**
   * @return The name of the current database
   */
  get databaseName() {
    return (this._schemaService.currentDatabaseName);
  }

  /**
   * The user has decided to start dragging something from the sidebar.
   */
  startTableDrag(evt: DragEvent, table: Table) {
    try {
      this._dragService.dragStart(evt, [
        {
          language: "sql",
          name: "tableIntroduction",
          properties: {
            "name": table.name
          }
        }
      ]);
    } catch (e) {
      alert(e);
    }
  }

  /**
   * The user has decided to start dragging something from the sidebar.
   */
  startColumnDrag(evt: DragEvent, table: Table, column: Column) {
    try {
      this._dragService.dragStart(evt, [
        {
          language: "sql",
          name: "columnName",
          properties: {
            "columnName": column.name,
            "refTableName": table.name
          }
        }
      ]);
    } catch (e) {
      alert(e);
    }
  }

  /**
   * @param table The table that may have its columns filtered
   * @return A list of columns that may be rendered
   */
  columnsOfTable(table: Table): Column[] {
    const searchType: QualifiedTypeName = { languageName: "sql", typeName: "tableIntroduction" };
    const knownTables = new Set(
      this._codeResource.syntaxTreePeek
        .getNodesOfType(searchType)
        .map(node => node.properties['name'])
    );

    if (knownTables.has(table.name)) {
      return (table.columns);
    } else {
      return ([]);
    }
  }
}
