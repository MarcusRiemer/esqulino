import 'rxjs/Rx';

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
    scope : ScopeFlags
}

/**
 * Coordinates dragging events among all components that make use of
 * drag & drop to construct queries.
 */
@Injectable()
export class DragService {
    private _eventSource : Subject<SqlDragEvent>;

    private _currentDrag : [ScopeFlags];

    constructor() {
        this._eventSource = new Subject();
    }

    /**
     * Starts a drag operation for the given scope.
     *
     * @param scope The scope that the dragged item matches.
     */
    private dragStart(evt : DragEvent, scope : [ScopeFlags]) {
        this._currentDrag = scope;
        const dragType = this._currentDrag.join(", ");

        evt.dataTransfer.effectAllowed = 'copy';
        evt.dataTransfer.setData('text/plain', dragType);
        console.log(`Drag started: ${dragType}`);

        evt.target.addEventListener("dragend", () => {
            this._currentDrag = null;
            console.log(`Drag ended: ${dragType}`);
        });
    }

    /**
     * Starts a drag event involving a constant
     *
     * @param evt The DOM drag event to enrich
     */
    startConstantDrag(evt : DragEvent) {
        this.dragStart(evt, ["expr", "constant"]);
    }

    /**
     * Starts a drag event involving a column
     *
     * @param evt The DOM drag event to enrich
     */
    startColumnDrag(evt : DragEvent, table : string, column : string) {
        this.dragStart(evt, ["expr", "column"]);
        evt.dataTransfer.setData("column", column);
        evt.dataTransfer.setData("table", table);
    }

    /**
     * Starts a drag event involving a compound expression
     *
     * @param evt The DOM drag event to enrich
     */
    startCompoundDrag(evt : DragEvent) {
        this.dragStart(evt, ["expr", "compound"]);
    }

    /**
     * Starts a drag event involving a table.
     *
     * @param evt The DOM drag event to enrich
     */
    startTableDrag(evt : DragEvent) {
        this.dragStart(evt, ["table"]);
    }

    /**
     * @return True, if a constant is involved in the current drag operation
     */
    get activeConstant() {
        return (this._currentDrag && this._currentDrag.indexOf("constant") >= 0);
    }

    /**
     * @return True, if a column is involved in the current drag operation
     */
    get activeColumn() {
        return (this._currentDrag && this._currentDrag.indexOf("column") >= 0);
    }

    /**
     * @return True, if a column is involved in the current drag operation
     */
    get activeCompound() {
        return (this._currentDrag && this._currentDrag.indexOf("compound") >= 0);
    }
}
