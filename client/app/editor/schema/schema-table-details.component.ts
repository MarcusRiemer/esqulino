import {Component, Input, OnInit, OnDestroy}       from '@angular/core';

import {TableDescription, ColumnDescription}       from '../../shared/schema.description'

import {ProjectService, Project}        from '../project.service'
import {QueryService}                   from '../query.service'
import {ToolbarService}                 from '../toolbar.service'


/**
 * Displays the schema for a list of tables.
 */
@Component({
    templateUrl: 'app/editor/schema/templates/schema-table-details.html',
    selector: "sql-table-details"
})
export class SchemaTableDetailsComponent implements OnInit, OnDestroy {

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
        console.log("Details loading!");
        this.table = this.tables[0];

        //this._toolbarService.resetItems();
        this._toolbarService.savingEnabled = false;
        let btnCreate = this._toolbarService.addButton("back", "Zurück", "arrow-left", "b");
        let subRef = btnCreate.onClick.subscribe((res) => {
            console.log("Zurück!");
        })
        this._subscriptionRefs.push(subRef);
    }

    ngOnDestroy() {
        this._subscriptionRefs.forEach( ref => ref.unsubscribe() );
        this._subscriptionRefs = [];
    }
}