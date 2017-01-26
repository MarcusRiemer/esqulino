import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'

import { Table } from '../../shared/schema'

import { ProjectService, Project } from '../project.service'
import { ToolbarService } from '../toolbar.service'
import {
    AddNewColumn, DeleteColumn,
    SwitchColumnOrder, RenameColumn,
    ChangeColumnType, ChangeColumnPK,
    ChangeColumnNN, ChangeColumnStandartValue,
    ChangeTableName, TableCommandHolder
} from '../../shared/schema/table-commands'


/**
 * Displays the schema for a list of tables.
 */
@Component({
    templateUrl: 'templates/schema-table-editor.html',
    selector: "sql-table-editor"
})
export class SchemaTableEditorComponent implements OnInit, OnDestroy {

    constructor(
        private _projectService: ProjectService,
        private _routeParams: ActivatedRoute,
        private _toolbarService: ToolbarService) {

    }

    /**
     * The currently edited table
     */
    table: Table;

    /**
    * The currently edited project
    */
    private _project: Project;

    /**
     * Should the preview of the Table be shown
     */
    private _showPreview: boolean = false;

    /**
     * Subscriptions that need to be released
     */
    private _subscriptionRefs: any[] = [];

    /**
     * True, if creation should be allowed from this component.
     */
    @Input() allowCreate: boolean = false;

    /**
     * Holder for all Commands with do and redo function
     */
    private _commandsHolder: TableCommandHolder;

    /**
     * Temp value for string values, setting during the focus
     */
    private _oldValue: string;



    /**
     * Load the project to access the schema
     */
    ngOnInit() {
        console.log("Editor loading!");
        let subRef = this._routeParams.params.subscribe(params => {
            var tableName = params['tableName'];
            this._projectService.activeProject
                .subscribe(res => {
                    this._project = res;
                    this.table = res.schema.getTable(tableName);
                })
        });
        this._subscriptionRefs.push(subRef);

        this._toolbarService.resetItems();

        // Button to show the preview of the currently editing table
        let btnCreate = this._toolbarService.addButton("preview", "Vorschau", "search", "p");
        subRef = btnCreate.onClick.subscribe((res) => {
            this.previewBtn();
        })
        this._subscriptionRefs.push(subRef);

        // Button to undo the last change
        btnCreate = this._toolbarService.addButton("undo", "Undo", "undo", "z");
        subRef = btnCreate.onClick.subscribe((res) => {
            this.undoBtn();
        })
        this._subscriptionRefs.push(subRef);

        // Button to redo the last undone change
        btnCreate = this._toolbarService.addButton("redo", "Redo", "repeat", "y");
        subRef = btnCreate.onClick.subscribe((res) => {
            this.redoBtn();
        })
        this._subscriptionRefs.push(subRef);

        // Button to save all changes on the Server
        this._toolbarService.savingEnabled = false;
        btnCreate = this._toolbarService.addButton("save", "Save", "floppy-o", "s");
        subRef = btnCreate.onClick.subscribe((res) => {
            this.saveBtn();
        })
        this._subscriptionRefs.push(subRef);

        // Button to cancle the editing without saving
        btnCreate = this._toolbarService.addButton("cancel", "Cancel", "times", "x");
        subRef = btnCreate.onClick.subscribe((res) => {
            this.cancelBtn();
        })
        this._subscriptionRefs.push(subRef);

        this._commandsHolder = new TableCommandHolder(this.table);
    }

    ngOnDestroy() {
        this._subscriptionRefs.forEach(ref => ref.unsubscribe());
        this._subscriptionRefs = [];
    }

    /**
     * Function for the undo button
     */
    undoBtn() {
        this._commandsHolder.undo();
    }

    /**
     * Function for the redo button
     */
    redoBtn() {
        this._commandsHolder.redo();
    }

    /**
     * Function for the preview button
     */
    previewBtn() {
        this._showPreview = !this._showPreview;
    }

    /**
     * Function for the save button
     */
    saveBtn() {
        console.log("Save!");
    }

    /**
     * Function for the cancle button
     */
    cancelBtn() {
        console.log("Cancel!");
    }

    /**
     * Function to remove a column from the table
     * @param - index the index of the column to remove
     */
    removeColumn(index: number) {
        this._commandsHolder.do(new DeleteColumn(this.table, index));
    }

    /**
     * Function to add a new column to the table
     */
    addColumn() {
        this._commandsHolder.do(new AddNewColumn());
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
            this._commandsHolder.do(new RenameColumn(this.table, index, this._oldValue, newValue));
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
            this._commandsHolder.do(new ChangeColumnType(this.table, index, this._oldValue, newValue));
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
            this._commandsHolder.do(new ChangeColumnStandartValue(this.table, index, this._oldValue, newValue));
            this.clearOldValue();
        }
    }

    /**
     * Function that is invoked on unfocusing the table name input
     * @param newValue - the new value in the input
     */
    changedTableName(newValue: string) {
        if (this._oldValue != newValue) {
            this._commandsHolder.do(new ChangeTableName(this.table, this._oldValue, newValue));
            this.clearOldValue();
        }
    }
}
