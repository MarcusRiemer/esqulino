import {Component, Injector}            from 'angular2/core'
import {Router, RouteParams}            from 'angular2/router'

import {Query, Model}                   from '../../shared/query'

import {Project}                        from '../project'
import {ProjectService}                 from '../project.service'

import {QueryComponent, SqlStringPipe}  from './query'
import {SidebarComponent}               from './sidebar.component'

@Component({
    templateUrl: 'app/editor/query/templates/editor.html',
    directives: [QueryComponent, SidebarComponent],
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

    private _isSaving = false;
    
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

    /**
     * Saves this project to the server.
     */
    save() {
        this._isSaving = true;
        this._projectService.saveQuery(this.query.id)
            .subscribe(res => this._isSaving = false);
    }
}
