import { Component, Input, Output, EventEmitter } from "@angular/core";

import { Table } from "../../shared/schema";

import { SchemaService } from "../schema.service";
import { ProjectService, Project } from "../project.service";

/**
 * Displays the schema for a list of tables.
 */
@Component({
  templateUrl: "templates/schema-table.html",
  selector: "sql-table",
})
export class SchemaTableComponent {
  /**
   * The tables to display.
   */
  @Input() table: Table;

  /**
   * The currently edited project
   */
  private _project: Project;

  /**
   * Subscriptions that need to be released
   */
  private _subscriptionRefs: any[] = [];

  @Input() readOnly: boolean;

  @Input() columnToHighlight: any;

  @Output("columnToHighlightChange") selectedColumnName = new EventEmitter();

  constructor(
    private _schemaService: SchemaService,
    private _projectService: ProjectService
  ) {}

  ngOnInit() {
    let subRef = this._projectService.activeProject.subscribe((res) => {
      this._project = res;
    });

    this._subscriptionRefs.push(subRef);
  }

  onColumnMouseEnter(columnName: any) {
    if (!this.readOnly) {
      this.columnToHighlight = columnName;
      this.selectedColumnName.emit(columnName);
    }
  }

  onColumnMouseOut() {
    if (!this.readOnly) {
      this.columnToHighlight = undefined;
      this.selectedColumnName.emit(undefined);
    }
  }

  /**
   * True when table editing is enabled
   */
  editingEnabled: boolean = false;

  /**
   * Function to enable/disable table editing
   */
  toggleTableEditing() {
    this.editingEnabled = !this.editingEnabled;
  }

  /**
   * Getter editingEnabled
   */
  getEditingEnabled() {
    return this.editingEnabled;
  }

  tableIsCurrentlyEdited(tableName: string) {
    if (this._schemaService.getCurrentlyEdited()) {
      if (this._schemaService.getCurrentlyEditedTable()) {
        return this._schemaService.getCurrentlyEditedTable().name == tableName;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * Function to drop a Table;
   */
  async deleteTable() {
    try {
      await this._schemaService.deleteTable(this._project, this.table);
    } catch (error) {
      this.showError(error);
    }
  }

  /**
   * Function to show an alert [TODO: Make it look good]
   */
  showError(error: any) {
    window.alert(
      `Ein Fehler ist aufgetreten!\nNachricht: ${error
        .json()
        .errorBody.toString()
        .replace(new RegExp("\\\\", "g"), "")}`
    );
  }
}
