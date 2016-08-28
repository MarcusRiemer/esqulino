import {
    Component, Input, OnInit, OnDestroy, Inject
} from '@angular/core'
import {ActivatedRoute, Router}      from '@angular/router'

import {Query, Model}                from '../../shared/query'

import {SIDEBAR_MODEL_TOKEN}         from '../editor.token'
import {ProjectService}              from '../project.service'

import {DragService}                 from './drag.service'
import {OperatorPipe}                from './operator.pipe'

/**
 * The sidebar hosts elements that can be dragged onto the currently active
 * query. Additionally it sometimes offers a "trashcan" where items can be
 * dropped if they are meant to be deleted.
 */
@Component({
    templateUrl: 'app/editor/query/templates/sidebar.html',
    selector : "sql-sidebar"
})
export class QuerySidebarComponent implements OnInit, OnDestroy {
    /**
     * This ID is used to register this sidebar with the sidebar loader
     */
    public static get SIDEBAR_IDENTIFIER() { return "query" };

    /**
     * View Variable:
     * The currently edited query
     */
    @Input() query : Query;

    /**
     * View Variable:
     * The current operation the binary operator should use
     */
    @Input() binaryOperation : Model.Operator = "=";

    /**
     * Subscriptions that need to be released
     */
    private _subscriptionRefs : any[] = [];

    /**
     * @param _dragService The sidebar relies on the SQL Editors DragService
     */
    constructor(
        @Inject(SIDEBAR_MODEL_TOKEN) query : Query,
        private _dragService : DragService,
        private _projectService : ProjectService,        
        private _activatedRoute : ActivatedRoute,
        private _router : Router) {
        this.query = query;
    }

    ngOnInit() {
        
    }

    ngOnDestroy() {
        this._subscriptionRefs.forEach( ref => ref.unsubscribe() );
        this._subscriptionRefs = [];
    }

    /**
     * @return A list of currently allowed logic operators
     */
    get allowedLogic() {
        return (["<", "<=", "=", "<>", ">=", ">"]);
    }

    /**
     * @return A list of currently allowed math operators
     */
    get allowedMath() {
        return (["+", "-", "*", "/"]);
    }

    /**
     * Starts a drag event involving a constant
     *
     * @param evt The DOM drag event to enrich
     */
    startConstantDrag(evt : DragEvent) {
        this._dragService.startConstantDrag("sidebar", evt);
    }

    /**
     * Starts a drag event involving a star operator
     *
     * @param evt The DOM drag event to enrich
     */
    startStarDrag(evt : DragEvent) {
        this._dragService.startExpressionModelDrag({ star : { } }, "sidebar", evt);
    }

    /**
     * Starts a drag event involving a column
     *
     * @param evt The DOM drag event to enrich
     * @param table The name of the table
     * @param column The name of the column
     */
    startColumnDrag(evt : DragEvent, table : string, column : string) {
        this._dragService.startColumnDrag(table, column, "sidebar", evt);
    }

    /**
     * Starts a drag event involving a compound expression
     *
     * @param evt The DOM drag event to enrich
     */
    startCompoundDrag(evt : DragEvent) {
        this._dragService.startCompoundDrag(this.binaryOperation, "sidebar", evt);
    }

    /**
     * Starts a drag event involving a parameter expression
     *
     * @param evt The DOM drag event to enrich
     */
    startParameterDrag(evt : DragEvent) {
        this._dragService.startParameterDrag("sidebar", evt);
    }

    /**
     * Starts a drag event involving a parameter expression
     *
     * @param evt The DOM drag event to enrich
     */
    startOperatorDrag(op : Model.Operator, evt : DragEvent) {
        this._dragService.startOperatorDrag(op, "sidebar", evt);
    }

    /**
     * Starts a drag event involving a table.
     *
     * @param evt The DOM drag event to enrich
     */
    startTableDrag(table : string, evt : DragEvent) {
        this._dragService.startTableDrag({
                cross : "cross",
                table : {
                    name : table
                }
            }, "sidebar", evt);
    }
}
