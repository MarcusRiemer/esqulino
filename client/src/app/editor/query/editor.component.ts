import {Component, Input, OnInit}       from '@angular/core'
import {Router, ActivatedRoute}         from '@angular/router'

import {Observable}                     from 'rxjs/Observable'

import {
    Query, Model, SyntaxTree,
    SelectQueryResult, QueryRunErrorDescription
} from '../../shared/query'

import {ProjectService, Project}        from '../project.service'
import {PreferencesService}             from '../preferences.service'
import {RegistrationService}            from '../registration.service'
import {ToolbarService, ToolbarItem}    from '../toolbar.service'
import {SidebarService}                 from '../sidebar.service'
import {
    QueryService, QueryParamsDescription
} from '../query.service'
import {QuerySidebarComponent}          from './query.sidebar'

@Component({
    templateUrl: 'templates/editor.html',
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
     * The button that runs queries.
     */
    private _btnQuery : ToolbarItem;

    /**
     * Cache for user input. This allows parameters to be preserved when the user
     * switches back and forth between queries.
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
        private _sidebarService : SidebarService,
        private _preferences : PreferencesService,
        registrationService : RegistrationService
    ) {
    }

    /**
     * @return The result set of the last query
     */
    get result() {
        return (this._result);
    }

    /**
     * @return True, if a debug JSON model should be shown.
     */
    get showJsonModel() {
        return (this._preferences.showJsonModel);
    }

    /**
     * @return True, if the "I promise this query only touches a single row"-checkbox
     *         should be shown.
     */
    get showSingleRowCheckbox() : boolean {
        const validQueryType =
            this.query.select ||
            this.query.update ||
            this.query.delete;

        // Show if the single row property actually makes sense and any of the
        // following holds ...
        //
        // * The query currently promises a single row, the user must always
        //   be able to undo this promise.
        // * There is a `WHERE` component, without it would not make sense
        //   to promise a single value.
        return (validQueryType && (this.query.singleRow || (this.query as any).where))
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
        this.project = this._projectService.cachedProject;
        this._toolbarService.resetItems();
        
        // Reacting to saving
        this._toolbarService.savingEnabled = true;
        let btnSave = this._toolbarService.saveItem;

        let subRef = btnSave.onClick.subscribe( (res) => {
            btnSave.isInProgress = true;
            this._queryService.saveQuery(this.project, this.query)
                // Always delay visual feedback by 500ms
                .delay(500)
                .subscribe(res => btnSave.isInProgress = false);
        });

        this._subscriptionRefs.push(subRef)

        // Reacting to querying
        this._btnQuery = this._toolbarService.addButton("run", "Ausführen", "play", "r");
        subRef = this._btnQuery.onClick.subscribe( (res) => {
            this._btnQuery.isInProgress = true;
            this._queryService.runQuery(this.project, this.query, this.relevantArguments)
                .subscribe(res => {
                    this._btnQuery.isInProgress = false;
                    this._result = res;
                });
        });

        // Grab the correct project and query
        // this.updateQuery(this._routeParams.snapshot.params['queryId']);
        subRef = this._routeParams.params
            .subscribe(params => {
                this.updateQuery(params['queryId']);
            });
        this._subscriptionRefs.push(subRef);
    }

    ngOnDestroy() {
        this._subscriptionRefs.forEach( ref => ref.unsubscribe() );
        this._subscriptionRefs = [];
    }

    private updateQuery(queryId : string) {
        // Skip reloading anything if this is the same sidebar
        if (queryId && this.query && this.query.id === queryId) {
            return;
        }
        
        this.query = this.project.getQueryById(queryId);

        // Show the sidebar
        const sidebarId = QuerySidebarComponent.SIDEBAR_IDENTIFIER;
        this._sidebarService.showSingleSidebar(sidebarId, this.query);

        // Reset previous result
        this._result = undefined;

        // But show new results for ...
        // * SELECT queries ...
        // * that are valid ...
        // * and have all parameters assigned
        if (this.query.select &&
            this.query.isValid &&
            this.query.parameters.length === 0) {
            this._btnQuery.fire();
        }
    }
}
