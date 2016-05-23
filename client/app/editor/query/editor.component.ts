import {Component, Input, OnInit}       from '@angular/core'
import {Router, RouteSegment}           from '@angular/router'

import {Observable}                     from 'rxjs/Observable'

import {Query, Model}                   from '../../shared/query'
import {
    QueryResult, QueryRunErrorDescription
} from '../../shared/query.result'

import {Project}                        from '../project'
import {ProjectService}                 from '../project.service'
import {ToolbarService}                 from '../toolbar.service'
import {SidebarService}                 from '../sidebar.service'
import {QueryService}                   from '../query.service'

import {QueryComponent, SqlStringPipe}  from './sql.component'
import {SidebarComponent}               from './sidebar.component'
import {ResultComponent}                from './result.component'
import {ValidatorComponent}             from './validator.component'

@Component({
    templateUrl: 'app/editor/query/templates/editor.html',
    directives: [QueryComponent, SidebarComponent, ResultComponent, ValidatorComponent],
    providers: [],
    pipes: [SqlStringPipe],
})
export class QueryEditorComponent implements OnInit {
    /**
     * The currently edited query
     */
    public query : Query;

    /**
     * The currently edited project
     */
    public project : Project;

    private _result : QueryResult;

    /**
     * Used for dependency injection.
     */
    constructor(
        private _projectService : ProjectService,
        private _queryService : QueryService,
        private _toolbarService : ToolbarService,
        private _routeParams : RouteSegment,
        private _sidebarService : SidebarService
    ) {
        this._sidebarService.showSidebar("query");
        this._toolbarService.resetItems();
    }

    /**
     * @return The result set of the last query
     */
    get result() {
        return (this._result);
    }

    /**
     * Load the project to access the schema and the queries.
     */
    ngOnInit() {
        // Grab the correct project and query
        var queryId = this._routeParams.getParam('queryId');
        this._projectService.activeProject
            .subscribe(res => {
                // Project is loaded, display the correct  query
                this.project = res;
                this.query = this.project.getQueryById(queryId);
            });

        // Reacting to saving
        this._toolbarService.savingEnabled = true;
        let btnSave = this._toolbarService.saveItem;

        btnSave.onClick.subscribe( (res) => {
            btnSave.isInProgress = true;
            this._queryService.saveQuery(this.project, this.query)
                // Always delay visual feedback by 500ms
                .delay(500)
                .subscribe(res => btnSave.isInProgress = false);
        });

        // Reacting to querying
        let btnQuery = this._toolbarService.addButton("run", "Ausführen", "search", "r");
        btnQuery.onClick.subscribe( (res) => {
            btnQuery.isInProgress = true;
            this._queryService.runQuery(this.project, this.query)
                .subscribe(res => {
                    btnQuery.isInProgress = false;
                    this._result = res;
                });
        });
    }
}
