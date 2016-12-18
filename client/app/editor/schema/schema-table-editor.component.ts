import {Component, Input, OnInit, OnDestroy}        from '@angular/core';
import {Router, ActivatedRoute}                     from '@angular/router'

import {Table}                                      from '../../shared/schema'

import {ProjectService, Project}                    from '../project.service'
import {ToolbarService}                             from '../toolbar.service'



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
        private _routeParams : ActivatedRoute,
        private _toolbarService: ToolbarService) {
    }

    /**
     * The currently edited table
     */
    table : Table;

     /**
     * The currently edited project
     */
    private _project : Project;

    /**
     * Should the preview of the Table be shown
     */
    private _showPreview : boolean = false;

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
    }

    ngOnDestroy() {
        this._subscriptionRefs.forEach( ref => ref.unsubscribe() );
        this._subscriptionRefs = [];
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

    removeColumn(index : number) {
        this.table.removeColumn(index);
    }

    addColumn() {
        this.table.addColumn();
    }

}