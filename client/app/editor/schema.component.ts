import {Component, Input, Injector, OnInit}     from '@angular/core';
import {CORE_DIRECTIVES}                        from '@angular/common';
import {Router, RouteParams, ROUTER_DIRECTIVES} from '@angular/router-deprecated';

import {TableDescription}                       from '../shared/schema.description'

import {Project}              from './project'
import {ProjectService}       from './project.service'
import {ToolbarService}       from './toolbar.service'
import {SchemaTableComponent} from './schema.table.component'

@Component({
    templateUrl: 'app/editor/templates/schema.html',
    directives: [ROUTER_DIRECTIVES, SchemaTableComponent]
})
export class SchemaComponent implements OnInit {
    /**
     * The currently edited project
     */
    public project : Project;

    /**
     * Used for dependency injection.
     */
    constructor(
        private _projectService: ProjectService,
        private _toolbarService: ToolbarService,
        private _routeParams: RouteParams,
        _injector: Injector
    ) {
    }

    /**
     * Load the project to access the schema
     */
    ngOnInit() {
        this._toolbarService.resetItems();
        this._toolbarService.savingEnabled = false;
        
        this._projectService.activeProject
            .subscribe(res => this.project = res);
    }

    onCreateSelect(tableName : string) {
        this._projectService.createSelect(tableName)
            .subscribe( (res) => console.log(`Created SELECT query for table "${tableName}"`));
    }

    onCreateInsert(tableName : string) {
        this._projectService.createInsert(tableName)
            .subscribe( (res) => console.log(`Created INSERT query for table "${tableName}"`));
    }
}
