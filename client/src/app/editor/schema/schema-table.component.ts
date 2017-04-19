import {Component, Input, Output, OnInit, OnDestroy, EventEmitter}        from '@angular/core';
import { Router, ActivatedRoute }                   from '@angular/router'

import {Table}                                      from '../../shared/schema'

import { SchemaService }                            from '../schema.service'
import {ProjectService, Project}                    from '../project.service'
import {ToolbarService}                             from '../toolbar.service'


/**
 * Displays the schema for a list of tables.
 */
@Component({
    templateUrl: 'templates/schema-table.html',
    selector: "sql-table"
})
export class SchemaTableComponent {

    /**
     * The tables to display.
     */
    @Input() table : Table;

    /**
    * The currently edited project
    */
    private _project: Project;

    /**
     * Subscriptions that need to be released
     */
    private _subscriptionRefs: any[] = [];

    @Input() readOnly : boolean;

    @Input() columnToHighlight : any;

    @Output('columnToHighlightChange') selectedColumnName = new EventEmitter();


    constructor(
        private _schemaService: SchemaService,
        private _projectService: ProjectService,
        private _routeParams: ActivatedRoute,
        private _toolbarService: ToolbarService) {

    }

    ngOnInit() {
        console.log("Editor loading!");
        let subRef = this._projectService.activeProject
                    .subscribe(res => {
                        this._project = res;
                    });

        this._subscriptionRefs.push(subRef);
    }

    onColumnMouseEnter(columnName : any) {
        if(!this.readOnly) {
            this.columnToHighlight = columnName;
            this.selectedColumnName.emit(columnName);
        }
    }

    onColumnMouseOut() {
        if(!this.readOnly) {
            this.columnToHighlight = undefined;
            this.selectedColumnName.emit(undefined);
        }
    }

    /**
     * True when table editing is enabled
     */
    editingEnabled : boolean = false;

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

    /**
     * Function to drop a Table;
     */
    deleteTable() {
        this._schemaService.deleteTable(this._project, this.table).subscribe(res => res,error => this.showError(error));
    }

    /**
     * Function to show an alert [TODO: Make it look good]
     */
    showError(error : any) {
        window.alert(`Ein Fehler ist aufgetretten! \n mit Nachricht: ${error.json().errorBody.toString().replace(new RegExp("\\\\", 'g'), '')}`);
    }
}
