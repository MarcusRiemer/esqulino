import {Component, Injector}            from 'angular2/core';
import {Router, RouteParams}            from 'angular2/router';

import {Query, Model}                   from '../shared/query';

import {Project}                        from './project'
import {ProjectService}                 from './project.service'
import {QueryComponent, SqlStringPipe}  from './query';

@Component({
    templateUrl: 'app/editor/templates/query-editor.html',
    directives: [QueryComponent],
    pipes: [SqlStringPipe],
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
    
    /**
     * Used for dependency injection.
     */
    constructor(
        private _projectService: ProjectService,
        private _routeParams: RouteParams,
        _injector: Injector
    ) {
    }

    /**
     * Load the project to access the schema
     */
    ngOnInit() {
        var queryId = this._routeParams.get('queryId');

        this._projectService.ActiveProject
            .subscribe(res => {
                // Project is loaded, display a query
                this.project = res;
                this.query = this.project.getQueryById(queryId);
            });
    }
}
