import {Component, Input, OnInit, OnDestroy}        from '@angular/core';

import {Table}                                      from '../../shared/schema'

import {ProjectService, Project}                    from '../project.service'
import {ToolbarService}                             from '../toolbar.service'


/**
 * Displays the schema for a list of tables.
 */
@Component({
    templateUrl: 'app/editor/schema/templates/schema-table.html',
    selector: "sql-table"
})
export class SchemaTableComponent implements OnInit, OnDestroy {
    /**
     * The tables to display.
     */
    @Input() tables : Table[];

    /**
     * True, if creation should be allowed from this component.
     */
    @Input() allowCreate : boolean = false;

    /**
     * The currently edited project
     */
    private _project : Project;

    /**
     * Subscriptions that need to be released
     */
    private _subscriptionRefs : any[] = [];

    /**
     * Should the details of every column in the table be shown 
     */
    showDetails: boolean[] = [];

    constructor(
        private _projectService: ProjectService,
        private _toolbarService: ToolbarService) {
    }

    /**
     * Load the project to access the schema
     */
    ngOnInit() {
        this._projectService.activeProject
            .subscribe(res =>{ 
                this._project = res;
            });
        this.initShowDetails();


        this._toolbarService.resetItems();
        this._toolbarService.savingEnabled = false;
        let btnCreate = this._toolbarService.addButton("import", "Import", "file", "i");
        let subRef = btnCreate.onClick.subscribe((res) => {
            console.log("File Import!");
        })
        this._subscriptionRefs.push(subRef);

        btnCreate = this._toolbarService.addButton("lock", "Lock", "lock", "l");
        subRef = btnCreate.onClick.subscribe((res) => {
            console.log("Lock!");
            this.toggleTableEditing();
        })
        this._subscriptionRefs.push(subRef);
    }


    ngOnDestroy() {
        this._subscriptionRefs.forEach( ref => ref.unsubscribe() );
        this._subscriptionRefs = [];
    }

    /**
     * Function to initialize the array showDetails
     */
    initShowDetails() {
        for(let table in this.tables) {
                this.showDetails[table] = false;
            }
    }

    /**
     * Function to get the value if table with index index shows details
     * IN: index - the index of the table to get the details visibility value
     */
    getShowDetails(index : number) {
        return this.showDetails[index];
    }

    /**
     * Function to toggle the visibility of the table details
     * IN: index - the index of the table to toggle the details visibility
     */
    clickToggleDetails(index : number) {
        this.showDetails[index] = !this.showDetails[index];
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
}
