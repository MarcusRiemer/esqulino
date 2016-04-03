import 'rxjs/Rx';

import {Subject}                from 'rxjs/Subject'
import {Injectable}             from 'angular2/core';

/**
 * The scopes a drag event could affect
 */
export type SqlScope = "expr" | "column" | "constant" | "compund" | "table";

/**
 * Abstract information about the drag event.
 */
export interface SqlDragEvent {
    scope : SqlScope
}

/**
 * Coordinates dragging events among all components that make use of
 * drag & drop to construct queries.
 */
@Injectable()
export class DragService {
    private _eventSource : Subject<SqlDragEvent>;

    constructor() {
        this._eventSource = new Subject();
    }

    /**
     * Starts a drag event.
     *
     * @param evt The DOM drag event to enrich
     */
    startConstantDrag(evt : DragEvent) {
        const expr : SqlScope = "expr";
        const constant : SqlScope = "constant";
        const dragType = `${expr}, ${constant}`;

        evt.dataTransfer.effectAllowed = 'copy';
        evt.dataTransfer.setData('text/plain', dragType);
        console.log(`Drag started: ${dragType}`);
    }
}
