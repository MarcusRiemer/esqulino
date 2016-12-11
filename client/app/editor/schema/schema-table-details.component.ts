import {Component, Input, OnInit, OnDestroy}       from '@angular/core';
import {Router, ActivatedRoute}                     from '@angular/router'

import {Table}                                      from '../../shared/schema'

import {SchemaService}                              from '../schema.service'
import {ProjectService, Project}                    from '../project.service'
import {ToolbarService}                             from '../toolbar.service'


/**
 * Displays the schema for a list of tables.
 */
@Component({
    templateUrl: 'app/editor/schema/templates/schema-table-details.html',
    selector: "sql-table-details"
})
export class SchemaTableDetailsComponent implements OnInit, OnDestroy {

    constructor(
        private _schemaService: SchemaService,
        private _projectService: ProjectService,
        private _routeParams : ActivatedRoute,
        private _toolbarService: ToolbarService) {
    }

    /**
     * The currently shown table
     */
     table : Table;

     /**
     * The currently edited project
     */
    private _project : Project;

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
        let subRef = this._routeParams.params.subscribe(params => {
            var tableName = params['tableName'];
            this._projectService.activeProject
            .subscribe(res => {
                this._project = res;
                this.table = res.schema.getTable(tableName);
            })    
        });
        this._subscriptionRefs.push(subRef);

        //this._toolbarService.resetItems();
        this._toolbarService.savingEnabled = false;
        let btnCreate = this._toolbarService.addButton("back", "Zurück", "arrow-left", "b");
        subRef = btnCreate.onClick.subscribe((res) => {
            this.backBtn();
        })
        this._subscriptionRefs.push(subRef);
    }

    ngOnDestroy() {
        this._subscriptionRefs.forEach( ref => ref.unsubscribe() );
        this._subscriptionRefs = [];
    }

    backBtn() {
        console.log("Zurück!");
    }
}