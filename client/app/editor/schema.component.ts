import {Component, OnInit}                      from 'angular2/core';
import {CORE_DIRECTIVES}                        from 'angular2/common';
import {Router, RouteParams, ROUTER_DIRECTIVES} from 'angular2/router';

import {Table}          from '../shared/table'

import {Project}        from './project'
import {ProjectService} from './project.service'

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
        private _routeParams: RouteParams
    ) { }

    /**
     * Load the project to access the schema
     */
    ngOnInit() {
        var projectId = this._routeParams.get('id');
        this._projectService.getProject(projectId)
            .then(res => this.project = res);
    }
}
