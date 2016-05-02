import {Component, Input, Injector, OnInit}     from 'angular2/core';
import {CORE_DIRECTIVES}                        from 'angular2/common';
import {Router, RouteParams, ROUTER_DIRECTIVES} from 'angular2/router';

import {TableDescription}                       from '../shared/schema.description'

import {Project}        from './project'
import {ProjectService} from './project.service'
import {ToolbarService} from './toolbar.service'

@Component({
    templateUrl: 'app/editor/templates/schema.html',
    directives: [ROUTER_DIRECTIVES]
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

    onCreateQuery(tableName : string) {
        console.log("onCreateQuery");
        
        this._projectService.createQuery(tableName)
            .then( (res) => console.log(`Created query for table "${tableName}"`));
    }
}
