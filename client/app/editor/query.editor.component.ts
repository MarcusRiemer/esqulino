import {Component, Injector}            from 'angular2/core';
import {Router, RouteParams}            from 'angular2/router';

import {Query, Model}           from '../shared/query';

import {Project}                from './project'
import {ProjectService}         from './project.service'
import {QueryComponent}         from './query';

@Component({
    templateUrl: 'app/editor/templates/query-editor.html',
    directives: [QueryComponent]
})
export class QueryEditorComponent {
    /**
     * The currently edited query
     */
    public query : Query;

    /**
     * The currently edited project
     */
    public project : Project;

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
        var queryId = this._routeParams.get('queryId');


        this._projectService.getProject(projectId)
            .subscribe(res => {
                // Project is loaded, display a query
                this.project = res;
                this.query = this.project.getQueryById(queryId);

                console.log(this.query);
            });
    }
}
