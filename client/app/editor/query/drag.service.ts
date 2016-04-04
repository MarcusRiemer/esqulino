import 'rxjs/Rx';

import {Model}                  from '../../shared/query.model'

import {Subject}                from 'rxjs/Subject'
import {Injectable}             from 'angular2/core';

/**
 * The scopes a drag event could affect
 */
export type ScopeFlags = "expr" | "column" | "constant" | "compound" | "table" ;
export type OriginFlags = "query" | "sidebar";

/**
 * Abstract information about the drag event.
 */
export interface SqlDragEvent {
    scope : ScopeFlags[]
    origin : OriginFlags
    expr? : Model.Expression
}

/**
 * Coordinates dragging events among all components that make use of
 * drag & drop to construct queries.
 */
@Injectable()
export class DragService {
    private _eventSource : Subject<SqlDragEvent>;

    private _currentDrag : SqlDragEvent;

    constructor() {
        this._eventSource = new Subject();
    }

    /**
     * Starts a drag operation for the given scope.
     *
     * @param scope The scope that the dragged item matches.
     */
    private dragStart(evt : DragEvent, sqlEvt : SqlDragEvent) {
        this._currentDrag = sqlEvt;
        const dragData = JSON.stringify(this._currentDrag);

        evt.dataTransfer.effectAllowed = 'copy';
        evt.dataTransfer.setData('text/plain', dragData);
        console.log(`Drag started: ${dragData}`);

        evt.target.addEventListener("dragend", () => {
            this._currentDrag = null;
            console.log(`Drag ended: ${dragData}`);
        });
    }

    /**
     * Starts a drag event involving a constant
     *
     * @param evt The DOM drag event to enrich
     */
    startConstantDrag(evt : DragEvent) {
        this.dragStart(evt, {
            scope : ["expr", "constant"],
            origin : "sidebar",
            expr : {
                constant : {
                    type : "INTEGER",
                    value : "1"
                }
            }
        });
    }

    /**
     * Starts a drag event involving a column
     *
     * @param evt The DOM drag event to enrich
     */
    startColumnDrag(evt : DragEvent, table : string, column : string) {
        this.dragStart(evt, {
            scope : ["expr", "column"],
            origin : "sidebar",
            expr : {
                singleColumn : {
                    column : column,
                    table : table
                }
            }
        });
    }

    /**
     * Starts a drag event involving a compound expression
     *
     * @param evt The DOM drag event to enrich
     */
    startCompoundDrag(evt : DragEvent) {
        this.dragStart(evt, {
            scope : ["expr", "compound"],
            origin : "sidebar"
        });
    }

    /**
     * Starts a drag event involving a table.
     *
     * @param evt The DOM drag event to enrich
     */
    startTableDrag(evt : DragEvent) {
        this.dragStart(evt, {
            scope : ["table"],
            origin : "sidebar"
        });
    }

    /**
     * @return True, if a constant is involved in the current drag operation
     */
    get activeExpression() {
        return (this._currentDrag && this._currentDrag.scope.indexOf("expr") >= 0);
    }

    /**
     * @return True, if a constant is involved in the current drag operation
     */
    get activeConstant() {
        return (this._currentDrag && this._currentDrag.scope.indexOf("constant") >= 0);
    }

    /**
     * @return True, if a column is involved in the current drag operation
     */
    get activeColumn() {
        return (this._currentDrag && this._currentDrag.scope.indexOf("column") >= 0);
    }

    /**
     * @return True, if a column is involved in the current drag operation
     */
    get activeCompound() {
        return (this._currentDrag && this._currentDrag.scope.indexOf("compound") >= 0);
    }
}
