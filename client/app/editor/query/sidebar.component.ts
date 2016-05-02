import {Component, Input}            from 'angular2/core'

import {QuerySelect, Model}          from '../../shared/query'

import {DragService}                 from './drag.service'
import {OperatorPipe}                from './operator.pipe'

/**
 * The sidebar hosts elements that can be dragged onto the currently active
 * query. Additionally it sometimes offers a "trashcan" where items can be
 * dropped if they are meant to be deleted.
 */
@Component({
    templateUrl: 'app/editor/query/templates/sidebar.html',
    selector : 'sql-sidebar',
    pipes : [OperatorPipe]
})
export class SidebarComponent {
    /**
     * View Variable:
     * The currently edited query
     */
    @Input() query : QuerySelect;

    /**
     * View Variable:
     * The current operation the binary operator should use
     */
    @Input() binaryOperation : Model.Operator = "=";

    constructor(private _dragService : DragService) {
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
