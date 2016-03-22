import {Component, Injector}            from 'angular2/core'
import {Router, RouteParams}            from 'angular2/router'

import {Query, Model}                   from '../../shared/query'
import {QueryResult, RawResult}         from '../../shared/result'

import {Project}                        from '../project'
import {ProjectService}                 from '../project.service'

import {QueryComponent, SqlStringPipe}  from './query'
import {SidebarComponent}               from './sidebar.component'
import {ResultComponent}                from './result.component'

@Component({
    templateUrl: 'app/editor/query/templates/editor.html',
    directives: [QueryComponent, SidebarComponent, ResultComponent],
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

    private _isQuerying = false;

    private _result : QueryResult;
    
    /**
     * Used for dependency injection.
     */
    constructor(
        private _projectService: ProjectService,
        private _routeParams: RouteParams,
        _injector: Injector
    ) {
    }

    get isSaving() {
        return (this._isSaving);
    }

    get isQuerying() {
        return (this._isQuerying);
    }

    get result() {
        return (this._result);
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
     * Saves the currently edited query to the server.
     */
    save() {
        this._isSaving = true;
        this._projectService.saveQuery(this.query.id)
            .subscribe(res => this._isSaving = false);
    }

    /**
     * Runs the currently edited query on the server.
     */
    run() {
        this._isQuerying = true;
        this._projectService.runQuery(this.query.id)
            .subscribe(res => {
                this._isQuerying = false;
                this._result = res;
            });
    }
}
