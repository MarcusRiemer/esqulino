import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { first } from "rxjs/operators";

import { Table, ColumnStatus } from "../../shared/schema";
import {
  AddNewColumn,
  DeleteColumn,
  SwitchColumnOrder,
  RenameColumn,
  ChangeColumnType,
  ChangeColumnPrimaryKey,
  ChangeColumnNotNull,
  ChangeColumnStandardValue,
  ChangeTableName,
  AddForeignKey,
  RemoveForeignKey,
} from "../../shared/schema/table-commands";

import { SchemaService } from "../schema.service";

import { ProjectService, Project } from "../project.service";
import { EditorToolbarService } from "../toolbar.service";
import { SidebarService } from "../sidebar.service";

import { TableEditorSidebarStackComponent } from "./table-editor-stack.sidebar";
import { TableEditorSidebarControlsComponent } from "./table-editor-controls.sidebar";

/**
 * Displays the schema for a list of tables.
 */
@Component({
  templateUrl: "templates/schema-table-editor.html",
  selector: "sql-table-editor",
})
export class SchemaTableEditorComponent implements OnInit, OnDestroy {
  constructor(
    private _schemaService: SchemaService,
    private _projectService: ProjectService,
    private _routeParams: ActivatedRoute,
    private _router: Router,
    private _toolbarService: EditorToolbarService,
    private _sidebarService: SidebarService
  ) {}

  /**
   * The original table name
   */
  private _originalTableName: string;

  /**
   * The currently edited table
   */
  table: Table;

  /**
   * The currently edited project
   */
  private _project: Project;

  get projectTables(): Table[] {
    return this._project.schema.tables;
  }

  getColumnsOfTable(): Table {
    return this._project.schema.getTable(this.fk_addTable);
  }

  /**
   * Boolean to check if a new Table is created or edited
   */
  isNewTable: boolean = false;

  /**
   * Should the preview of the Table be shown
   */
  private _showPreview: boolean = true;

  private get commandsHolder() {
    return this._schemaService.getCurrentlyEditedStack();
  }

  /**
   * Subscriptions that need to be released
   */
  private _subscriptionRefs: any[] = [];

  /**
   * True, if creation should be allowed from this component.
   */
  @Input() allowCreate: boolean = false;

  /**
   * Temp value for string values, setting during the focus
   */
  private _oldValue: string;

  /**
   * Values to simulate the switch function, later through drag
   */
  colToSwitch: number;
  switch_to: number;

  fk_fromColumn: number;
  fk_addTable: string;
  fk_addColumn: string;

  // Value to store the accured error
  dbErrorCode: number = -1;

  /**
   * Load the project to access the schema
   */
  ngOnInit() {
    console.log("Editor loading!");
    let subRef = this._routeParams.params.subscribe((params) => {
      this._originalTableName = params["tableName"];
      if (this._originalTableName) {
        // TODO: Rewrite this to use a guard
        if (this._schemaService.getCurrentlyEdited()) {
          if (
            this._originalTableName !=
            this._schemaService.getCurrentlyEditedTable().name
          ) {
            alert(
              "Eine andere Tabelle wurde zurzeit bearbeitet, dieser Vorgang wurde abgebrochen!"
            );
            let projref = this._projectService.activeProject.subscribe(
              (res) => {
                this._project = res;
                this._schemaService.initCurrentlyEdit(
                  res.schema.getTable(this._originalTableName)
                );
                this.table = this._schemaService.getCurrentlyEditedTable();
              }
            );
            this._subscriptionRefs.push(projref);
          } else {
            let projref = this._projectService.activeProject.subscribe(
              (res) => {
                this._project = res;
                this.table = this._schemaService.getCurrentlyEditedTable();
              }
            );
            this._subscriptionRefs.push(projref);
          }
        } else {
          let projref = this._projectService.activeProject.subscribe((res) => {
            this._project = res;
            this._schemaService.initCurrentlyEdit(
              res.schema.getTable(this._originalTableName)
            );
            this.table = this._schemaService.getCurrentlyEditedTable();
          });
          this._subscriptionRefs.push(projref);
        }
      } else {
        let projref = this._projectService.activeProject.subscribe((res) => {
          this._project = res;
        });
        this._subscriptionRefs.push(projref);
        this.isNewTable = true;
        this._schemaService.initCurrentlyEdit(
          new Table(
            { name: "", columns: [], foreign_keys: [], system_table: false },
            [],
            []
          )
        );
        this.table = this._schemaService.getCurrentlyEditedTable();
      }
    });
    this._subscriptionRefs.push(subRef);

    this._toolbarService.resetItems();

    // Button to show the preview of the currently editing table
    if (!this.isNewTable) {
      let btnCreate = this._toolbarService.addButton(
        "preview",
        "Vorschau",
        "search",
        "p"
      );
      subRef = btnCreate.onClick.subscribe((_) => {
        this.previewBtn();
      });
      this._subscriptionRefs.push(subRef);
    }

    // Button to undo the last change
    let btnCreate = this._toolbarService.addButton("undo", "Undo", "undo", "z");
    subRef = btnCreate.onClick.subscribe((_) => {
      this.undoBtn();
    });
    this._subscriptionRefs.push(subRef);

    // Button to redo the last undone change
    btnCreate = this._toolbarService.addButton("redo", "Redo", "repeat", "y");
    subRef = btnCreate.onClick.subscribe((_) => {
      this.redoBtn();
    });
    this._subscriptionRefs.push(subRef);

    // Button to save all changes on the Server
    this._toolbarService.savingEnabled = false;
    btnCreate = this._toolbarService.addButton(
      "save",
      "Speichern",
      "floppy-o",
      "s"
    );
    subRef = btnCreate.onClick.subscribe((_) => {
      this.saveBtn();
    });
    this._subscriptionRefs.push(subRef);

    // Button to cancle the editing without saving
    btnCreate = this._toolbarService.addButton(
      "cancel",
      "Abbrechen",
      "times",
      "x"
    );
    subRef = btnCreate.onClick.subscribe((_) => {
      this.cancelBtn();
    });
    this._subscriptionRefs.push(subRef);

    // Showing the sidebars
    const stackSidebarId = TableEditorSidebarStackComponent.SIDEBAR_IDENTIFIER;
    this._sidebarService.showSingleSidebar(stackSidebarId, null);

    const controlsSidebarId =
      TableEditorSidebarControlsComponent.SIDEBAR_IDENTIFIER;
    this._sidebarService.showAdditionalSidebar(controlsSidebarId, null);
  }

  ngOnDestroy() {
    this._subscriptionRefs.forEach((ref) => ref.unsubscribe());
    this._subscriptionRefs = [];
  }

  /**
   * Function for the undo button
   */
  undoBtn() {
    this.commandsHolder.undo();
  }

  /**
   * Function for the redo button
   */
  redoBtn() {
    this.commandsHolder.redo();
  }

  /**
   * Function for the preview button
   */
  previewBtn() {
    this._showPreview = !this._showPreview;
  }

  get showPreview() {
    return this._showPreview;
  }

  /**
   * Function for the save button
   */
  saveBtn() {
    console.log("Save!");
    // Do we need to create a new table or alter an existing table?
    if (this.isNewTable) {
      // Create new table
      if (this.table.name != "") {
        let desc = this.table.toModel();
        let tableToSend = new Table(desc, desc.columns, desc.foreign_keys);
        for (var i = tableToSend.columns.length - 1; i >= 0; i--) {
          console.log(tableToSend.columns[i].state);
          if (this.table.columns[i].state == ColumnStatus.deleted) {
            tableToSend.columns.splice(i, 1);
          }
        }
        console.log(tableToSend);
        let schemaref = this._schemaService
          .saveNewTable(this._project, tableToSend)
          .pipe(first())
          .subscribe(
            (_) => {
              window.alert("Änderungen gespeichert!");
              this._schemaService.clearCurrentlyEdited();
              this._router.navigate(["../../"], {
                relativeTo: this._routeParams,
              });
            },
            (error) => this.showError(error)
          );
        this._subscriptionRefs.push(schemaref);
      } else {
        alert("Tabellenname ist leer!");
      }
    } else {
      // Alter existing table
      this.dbErrorCode = -1;
      this.commandsHolder.prepareToSend();
      let schemaref = this._schemaService
        .sendAlterTableCommands(
          this._project,
          this._originalTableName,
          this.commandsHolder
        )
        .pipe(first())
        .subscribe(
          (_) => {
            window.alert("Änderungen gespeichert!");
            this._schemaService.clearCurrentlyEdited();
            this._router.navigate(["../../"], {
              relativeTo: this._routeParams,
            });
          },
          (error) => this.showError(error)
        );
      this._subscriptionRefs.push(schemaref);
    }
  }

  /**
   * Function to show an alert [TODO: Make it look good]
   */
  showError(error: any) {
    this.dbErrorCode = error.json().index;
    if (error.json().errorCode == 1) {
      window.alert(
        `Ein Fehler ist aufgetretten in Stacknummer: ${
          error.json().index
        } \n mit Nachricht: ${error
          .json()
          .errorBody.toString()
          .replace(new RegExp("\\\\", "g"), "")}`
      );
    } else if (error.json().errorCode == 2) {
      window.alert(
        `Nach der Änderung im Stack Nummer: ${
          error.json().index
        } ist die Datenbank nicht mehr konsistent \n Datenbank meldet: ${error
          .json()
          .errorBody.toString()
          .replace(new RegExp("\\\\", "g"), "")}`
      );
    } else if (error.json().errorCode == 3) {
      window.alert(
        `Ein Fehler ist aufgetretten! \n mit Nachricht: ${error
          .json()
          .errorBody.toString()
          .replace(new RegExp("\\\\", "g"), "")}`
      );
    }
  }

  /**
   * Function for the cancle button
   */
  cancelBtn() {
    console.log("Cancel!");
    if (!this.isNewTable) {
      this._schemaService.clearCurrentlyEdited();
    }
    this._router.navigate(["../../"], { relativeTo: this._routeParams });
  }

  /**
   * Function to remove a column from the table
   * @param - index the index of the column to remove
   */
  removeColumn(index: number) {
    if (this.table.getColumnByIndex(index).state != ColumnStatus.deleted) {
      this.commandsHolder.do(new DeleteColumn(this.table, index));
    }
  }

  removeErrorCode() {
    if (this.commandsHolder.activeIndex + 1 == this.dbErrorCode) {
      this.dbErrorCode = -1;
    }
  }

  /**
   * Function to add a new column to the table
   */
  addColumn() {
    this.removeErrorCode();
    this.commandsHolder.do(new AddNewColumn());
  }

  /**
   * function to clear the temp value
   */
  private clearOldValue() {
    this._oldValue = "";
  }

  /**
   * Function to save the current value in Input Fields
   */
  saveTempValue(oldValue: string) {
    this._oldValue = oldValue;
  }

  /**
   * Function that is invoked on unfocusing the column name input
   * @param index - the index of the column
   * @param newValue - the new value in the input
   */
  changedColumnName(index: number, newValue: string) {
    if (this._oldValue != newValue) {
      this.removeErrorCode();
      this.commandsHolder.do(
        new RenameColumn(this.table, index, this._oldValue, newValue)
      );
      this.clearOldValue();
    }
  }

  /**
   * Function that is invoked on unfocusing the column type input
   * @param index - the index of the column
   * @param newValue - the new value in the input
   */
  changedColumnType(index: number, newValue: string) {
    if (this._oldValue != newValue) {
      this.removeErrorCode();
      this.commandsHolder.do(
        new ChangeColumnType(this.table, index, this._oldValue, newValue)
      );
      this.clearOldValue();
    }
  }

  /**
   * Function that is invoked on unfocusing the column standart value input
   * @param index - the index of the column
   * @param newValue - the new value in the input
   */
  changedColumnStandartValue(index: number, newValue: string) {
    if (this._oldValue != newValue) {
      this.removeErrorCode();
      this.commandsHolder.do(
        new ChangeColumnStandardValue(
          this.table,
          index,
          this._oldValue,
          newValue
        )
      );
      this.clearOldValue();
    }
  }

  /**
   * Function that is invoked on unfocusing the table name input
   * @param newValue - the new value in the input
   */
  changedTableName(newValue: string) {
    if (this._oldValue != newValue) {
      this.removeErrorCode();
      this.commandsHolder.do(
        new ChangeTableName(this.table, this._oldValue, newValue)
      );
      this.clearOldValue();
    }
  }

  /**
   * Function to change the Column order [later changed to drag]
   */
  changeColumnOrder() {
    if (this.colToSwitch != undefined && this.switch_to != undefined) {
      this.removeErrorCode();
      this.commandsHolder.do(
        new SwitchColumnOrder(this.table, this.colToSwitch, this.switch_to)
      );
    }
    this.switch_to = undefined;
    this.colToSwitch = undefined;
  }

  /**
   * Function to add a Foreign Key [later changed to drag]
   */
  addForeignKey() {
    if (
      this.fk_addColumn != undefined &&
      this.fk_addTable != undefined &&
      this.fk_fromColumn != undefined
    ) {
      this.removeErrorCode();
      this.commandsHolder.do(
        new AddForeignKey(this.table, this.fk_fromColumn, {
          references: [
            {
              to_table: this.fk_addTable,
              from_column: this.table.getColumnByIndex(this.fk_fromColumn).name,
              to_column: this.fk_addColumn,
            },
          ],
        })
      );
    }
    this.fk_addColumn = undefined;
    this.fk_addTable = undefined;
    this.fk_fromColumn = undefined;
  }

  /**
   * Function to add a Foreign Key [later changed to drag]
   */
  removeForeignKey(
    fk_fromColumn: number,
    fk_addTable: string,
    fk_addColumn: string
  ) {
    this.removeErrorCode();
    this.commandsHolder.do(
      new RemoveForeignKey(this.table, fk_fromColumn, {
        references: [
          {
            to_table: fk_addTable,
            from_column: this.table.getColumnByIndex(fk_fromColumn).name,
            to_column: fk_addColumn,
          },
        ],
      })
    );
  }

  /**
   * Function to change the status of the primary key constraint
   * @param index - index of the column
   */
  ChangeColumnPrimaryKeyStatus(index: number) {
    this.removeErrorCode();
    this.commandsHolder.do(new ChangeColumnPrimaryKey(this.table, index));
  }

  /**
   * Function to change the status of the not null constraint
   * @param index - index of the column
   */
  ChangeColumnNotNullStatus(index: number) {
    this.removeErrorCode();
    this.commandsHolder.do(new ChangeColumnNotNull(this.table, index));
  }
}
