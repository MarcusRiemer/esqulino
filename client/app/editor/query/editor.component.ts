import {Component, Input, OnInit}       from '@angular/core'
import {Router, ActivatedRoute}         from '@angular/router'

import {Observable}                     from 'rxjs/Observable'

import {Query, Model, SyntaxTree}       from '../../shared/query'
import {
    SelectQueryResult, QueryRunErrorDescription
} from '../../shared/query.result'

import {Project}                        from '../project'
import {ProjectService}                 from '../project.service'
import {ToolbarService}                 from '../toolbar.service'
import {SidebarService}                 from '../sidebar.service'
import {
    QueryService, QueryParamsDescription
} from '../query.service'

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

    /**
     * The result of the most recently run query
     */
    private _result : SelectQueryResult;

    /**
     * Subscriptions that need to be released
     */
    private _subscriptionRefs : any[] = [];

    /**
     * Cache for user input
     */
    private _arguments : QueryParamsDescription = { }
       
    /**
     * Used for dependency injection.
     */
    constructor(
        private _projectService : ProjectService,
        private _queryService : QueryService,
        private _toolbarService : ToolbarService,
        private _routeParams : ActivatedRoute,
        private _sidebarService : SidebarService
    ) {
        this._sidebarService.showSidebar(SidebarComponent.SIDEBAR_IDENTIFIER);
        this._toolbarService.resetItems();
    }

    /**
     * @return The result set of the last query
     */
    get result() {
        return (this._result);
    }

    /**
     * Retrieves all ParameterExpressions from the query.
     */
    get requiredParameters() : string[] {
        if (this.query) {
            return (this.query.getLeaves()
                    .filter(e => e instanceof SyntaxTree.ParameterExpression)
                    .map( (e : SyntaxTree.ParameterExpression) => e.key));
        } else {
            return ([]);
        }
    }

    /**
     * Retrieves all arguments that are stored in the current session.
     */
    get cachedArguments() : QueryParamsDescription {
        return (this._arguments);
    }

    /**
     * Retrieves all arguments that are used by the current query
     */
    get relevantArguments() : QueryParamsDescription {
        const required = this.requiredParameters;
        let toReturn : QueryParamsDescription = {};

        // TODO: There must be a nicer way to express this
        required.forEach(key => {
            toReturn[key] = this._arguments[key];
        });
        
        return (toReturn);
    }

    /**
     * Load the project to access the schema and the queries.
     */
    ngOnInit() {
        
        // Grab the correct project and query
        let subRef = this._routeParams.params.subscribe(param => {
            var queryId = param['queryId'];
            this._projectService.activeProject
                .subscribe(res => {
                    // Project is loaded, display the correct  query
                    this.project = res;
                    this.query = this.project.getQueryById(queryId);
                });
        });

        this._subscriptionRefs.push(subRef);

        // Reacting to saving
        this._toolbarService.savingEnabled = true;
        let btnSave = this._toolbarService.saveItem;

        subRef = btnSave.onClick.subscribe( (res) => {
            btnSave.isInProgress = true;
            this._queryService.saveQuery(this.project, this.query)
                // Always delay visual feedback by 500ms
                .delay(500)
                .subscribe(res => btnSave.isInProgress = false);
        });

        this._subscriptionRefs.push(subRef)

        // Reacting to querying
        let btnQuery = this._toolbarService.addButton("run", "Ausführen", "search", "r");
        subRef = btnQuery.onClick.subscribe( (res) => {
            btnQuery.isInProgress = true;
            this._queryService.runQuery(this.project, this.query, this.relevantArguments)
                .subscribe(res => {
                    btnQuery.isInProgress = false;
                    this._result = res;
                });
        });

        this._subscriptionRefs.push(subRef)
    }

    ngOnDestroy() {
        this._subscriptionRefs.forEach( ref => ref.unsubscribe() );
        this._subscriptionRefs = [];
    }
}
