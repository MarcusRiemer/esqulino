import {Component, Input, OnInit, OnDestroy}       from '@angular/core';

import {TableDescription, ColumnDescription}       from '../../shared/schema'

import {ProjectService, Project}        from '../project.service'
import {QueryService}                   from '../query.service'
import {ToolbarService}                 from '../toolbar.service'


/**
 * Displays the schema for a list of tables.
 */
@Component({
    templateUrl: 'app/editor/schema/templates/schema-table-editor.html',
    selector: "sql-table-editor"
})
export class SchemaTableEditorComponent implements OnInit, OnDestroy {

    /**
     * The table to edit.
     */
    @Input() tables : TableDescription[];

    constructor(
        private _projectService: ProjectService,
        private _queryService: QueryService,
        private _toolbarService: ToolbarService) {
    }

    table : TableDescription;

    /**
     * Subscriptions that need to be released
     */
    private _subscriptionRefs : any[] = [];

    /**
     * True, if creation should be allowed from this component.
     */
    @Input() allowCreate : boolean = false;


    /**
     * Load the project to access the schema
     */
    ngOnInit() {
        console.log("Editor loading!");
        this.table = this.tables[0];

        //this._toolbarService.resetItems();
        this._toolbarService.savingEnabled = false;
        let btnCreate = this._toolbarService.addButton("save", "Save", "floppy-o", "s");
        let subRef = btnCreate.onClick.subscribe((res) => {
            console.log("Save!");
        })
        this._subscriptionRefs.push(subRef);

        btnCreate = this._toolbarService.addButton("cancel", "Cancel", "times", "x");
        subRef = btnCreate.onClick.subscribe((res) => {
            console.log("Save!");
        })
        this._subscriptionRefs.push(subRef);
    }

    ngOnDestroy() {
        this._subscriptionRefs.forEach( ref => ref.unsubscribe() );
        this._subscriptionRefs = [];
    }

    removeColumn(index : number) {
        this.table.columns.splice(index, 1);
    }

    addColumn() {
        var newColumn : ColumnDescription = {name : "New Column",
                                             index : this.table.columns.length,
                                             not_null : false,
                                             primary : false,
                                             type : "STRING"};
        this.table.columns.push(newColumn);
    }

}