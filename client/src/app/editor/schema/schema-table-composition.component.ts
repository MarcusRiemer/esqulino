import { Component, Input } from "@angular/core";

import { Table } from "../../shared/schema";

import { ProjectService, Project } from "../project.service";

/**
 * Displays the schema for a list of tables.
 */
@Component({
  templateUrl: "templates/schema-table-composition.html",
  selector: "sql-table-composition",
})
export class SchemaTableCompositionComponent {
  /**
   * The tables to display.
   */
  @Input() table: Table;

  @Input() highlightedColumn: string;

  tableForeignKey: Table;

  toHighLight: string;

  onHighlightedColumnChanged(columnName: string) {
    console.log(columnName);
  }

  /**
   * The currently edited project
   */
  public project: Project;

  /**
   * Used for dependency injection.
   */
  constructor(private _projectService: ProjectService) {}

  /**
   * Load the project to access the schema
   */
  ngOnInit() {
    this._projectService.activeProject.subscribe((res) => {
      this.project = res;
    });
  }

  getTargetTable(highlightedColumn: string): Table {
    const forenKeyTableName = this.table.columnIsForeignKeyOfTable(
      highlightedColumn
    );
    if (forenKeyTableName) {
      const table = this.project.schema.getTable(forenKeyTableName);
      return table;
    } else {
      return undefined;
    }
  }

  getTargetColumn(highlightedColumn: string): string {
    let forenKeyColumnName = this.table.columnIsForeignKeyOfColumn(
      highlightedColumn
    );
    return forenKeyColumnName;
  }
}
