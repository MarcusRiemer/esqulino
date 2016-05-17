import {Component, Input, OnInit}    from '@angular/core'
import {RouteSegment, Router}        from '@angular/router'

import {Query, Model}                from '../../shared/query'

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
    selector : "sql-sidebar",
    pipes : [OperatorPipe]
})
export class SidebarComponent {
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
     * @param _dragService The sidebar relies on the SQL Editors DragService
     */
    constructor(
        private _dragService : DragService,
        private _projectService : ProjectService,        
        private _routeParams : RouteSegment,
        private _router : Router) {
    }

    ngOnInit() {
        // Every time the URL changes
        this._router.changes.subscribe( () => {
            // Grab the current project
            this._projectService.activeProject
                .first() // One shot subscription
                .subscribe(res => {
                    if (res) {
                        // Grab the correct query id
                        const childRoute = this._router.routeTree.firstChild(this._routeParams);
                        const queryId = childRoute.getParam('queryId');

                        // Project is loaded, display the correct  query
                        this.query = res.getQueryById(queryId);
                    }
                });
        });
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

    /**
     * Something has been dropped on the delete indicator
     */
    onDeleteDrop(evt : DragEvent) {
        // Indicates we can drop here
        evt.preventDefault();

        this._dragService.activeSource.removeSelf();
    }

    /**
     * Something hovers over the delete indicator
     */
    onDeleteDrag(evt : DragEvent) {
        // Making sure Firefox does not start some kind of navigation
        evt.preventDefault();
    }
    
    /**
     * @return True, if the trashcan should be shown.
     */
    get hideTrash() : boolean {
        const source = this._dragService.activeSource;
        return (!source);
    }
}
