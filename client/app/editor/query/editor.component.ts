import {Component, Injector, Input}     from '@angular/core'
import {Router, RouteParams}            from '@angular/router-deprecated'

import {Observable}                     from 'rxjs/Observable'

import {Query, Model}                   from '../../shared/query'
import {
    QueryResult, QueryRunErrorDescription
} from '../../shared/query.result'

import {Project}                        from '../project'
import {ProjectService}                 from '../project.service'
import {ToolbarService}                 from '../toolbar.service'

import {QueryComponent, SqlStringPipe}  from './sql.component'
import {SidebarComponent}               from './sidebar.component'
import {ResultComponent}                from './result.component'
import {ValidatorComponent}             from './validator.component'
import {DragService}                    from './drag.service'

@Component({
    templateUrl: 'app/editor/query/templates/editor.html',
    directives: [QueryComponent, SidebarComponent, ResultComponent, ValidatorComponent],
    providers: [DragService],
    pipes: [SqlStringPipe],
})
export class QueryEditorComponent {
    /**
     * The currently edited query
     */
    @Input() public query : Query;

    /**
     * The currently edited project
     */
    public project : Project;

    private _result : QueryResult;
    
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
     * @return The result set of the last query
     */
    get result() {
        return (this._result);
    }

    /**
     * Load the project to access the schema
     */
    ngOnInit() {
        this._toolbarService.resetItems();
        
        // Reacting to saving
        this._toolbarService.savingEnabled = true;
        let saveItem = this._toolbarService.saveItem;
        
        saveItem.onClick.subscribe( (res) => {
            saveItem.isInProgress = true;
            this._projectService.saveQuery(this.query.id)
                // Always delay visual feedback by 500ms
                .delay(500)
                .subscribe(res => saveItem.isInProgress = false);
        });

        // Reacting to querying
        let queryItem = this._toolbarService.addButton("Ausführen", "search", "r");
        queryItem.onClick.subscribe( (res) => {
            queryItem.isInProgress = true;
            this._projectService.runQuery(this.query.id)
                .subscribe(res => {
                    queryItem.isInProgress = false;
                    this._result = res;
                });
        });
        
        var queryId = this._routeParams.get('queryId');

        this._projectService.activeProject
            .subscribe(res => {
                // Project is loaded, display the correct  query
                this.project = res;
                this.query = this.project.getQueryById(queryId);
            });
    }
}
