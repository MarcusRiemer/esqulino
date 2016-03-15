import {Component, Input, Injector, OnInit}     from 'angular2/core';
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
    @Input() public project : Project;

    private _parentRouteParams : RouteParams;

    /**
     * Used for dependency injection.
     */
    constructor(
        private _projectService: ProjectService,
        private _routeParams: RouteParams,
        _injector: Injector
    ) {
        // TODO: This is a hack taken from [0], lets hope Angular 2 improves on this
        // [0] http://stackoverflow.com/questions/34500147/angular-2-getting-routeparams-from-parent-component
        this._parentRouteParams = _injector.parent.parent.get(RouteParams);
    }

    /**
     * Load the project to access the schema
     */
    ngOnInit() {        
        var projectId = this._parentRouteParams.get('projectId');

        if (projectId) {
            this._projectService.getProject(projectId)
                .subscribe(res => this.project = res);
        } else {
            console.error(`Could not extract route param, got ${projectId}`);
        }
    }
}
