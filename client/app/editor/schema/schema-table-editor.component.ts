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
    templateUrl: 'app/editor/schema/templates/schema-table-editor.html',
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

    private _commandsHolder: TableCommandHolder;

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
        this._toolbarService.savingEnabled = false;
        let btnCreate = this._toolbarService.addButton("save", "Save", "floppy-o", "s");
        subRef = btnCreate.onClick.subscribe((res) => {
            this.saveBtn();
        })
        this._subscriptionRefs.push(subRef);

        btnCreate = this._toolbarService.addButton("preview", "Vorschau", "search", "p");
        subRef = btnCreate.onClick.subscribe((res) => {
            this.previewBtn();
        })
        this._subscriptionRefs.push(subRef);

        btnCreate = this._toolbarService.addButton("cancel", "Cancel", "times", "x");
        subRef = btnCreate.onClick.subscribe((res) => {
            this.cancelBtn();
        })
        this._subscriptionRefs.push(subRef);

        btnCreate = this._toolbarService.addButton("undo", "Undo", "undo", "z");
        subRef = btnCreate.onClick.subscribe((res) => {
            this.undoBtn();
        })
        this._subscriptionRefs.push(subRef);

        btnCreate = this._toolbarService.addButton("redo", "Redo", "repeat", "y");
        subRef = btnCreate.onClick.subscribe((res) => {
            this.redoBtn();
        })
        this._subscriptionRefs.push(subRef);

        this._commandsHolder = new TableCommandHolder(this.table);
    }

    ngOnDestroy() {
        this._subscriptionRefs.forEach(ref => ref.unsubscribe());
        this._subscriptionRefs = [];
    }

    undoBtn() {
        this._commandsHolder.undo();
    }

    redoBtn() {
        this._commandsHolder.redo();
    }

    previewBtn() {
        this._showPreview = !this._showPreview;
    }

    saveBtn() {
        console.log("Save!");
    }

    cancelBtn() {
        console.log("Cancel!");
    }

    removeColumn(index: number) {
        this._commandsHolder.do(new DeleteColumn(index, this.table.columns[index].state));
    }

    addColumn() {
        this._commandsHolder.do(new AddNewColumn());
    }

    clearOldValue() {
        this._oldValue = "";
    }

    /**
     * Function to save the current value in Input Fields
     */
    saveTempValue(oldValue: string) {
        this._oldValue = oldValue;
    }

    changedColumnName(index: number, newValue: string) {
        if (this._oldValue != newValue) {
            this._commandsHolder.do(new RenameColumn(index, this._oldValue, newValue));
            this.clearOldValue();
        }
    }

    changedColumnType(index: number, newValue: string) {
        if (this._oldValue != newValue) {
            this._commandsHolder.do(new ChangeColumnType(index, this._oldValue, newValue));
            this.clearOldValue();
        }
    }

    changedColumnStandartValue(index: number, newValue: string) {
        if (this._oldValue != newValue) {
            this._commandsHolder.do(new ChangeColumnStandartValue(index, this._oldValue, newValue));
            this.clearOldValue();
        }
    }

    changedTableName(newValue: string) {
        if (this._oldValue != newValue) {
            this._commandsHolder.do(new ChangeTableName(this._oldValue, newValue));
            this.clearOldValue();
        }
    }
}