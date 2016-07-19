import {Subject}                from 'rxjs/Subject'

import {Injectable}             from '@angular/core'

import {ReferencedQuery}        from '../../shared/page/index'
import {
    Column, Row, RowDescription, WidgetDescription
} from '../../shared/page/widgets/index'

/**
 * Hints about the origin of a drag operation
 */
export type OriginFlag = "sidebar" | "page"

/**
 * Possible callbacks for drop operations
 */
export interface DropCallbacks {
    /**
     * Called when dropped into the trash
     */
    onRemove? : () => void

    /**
     * Called when dropped on an existing row
     */
    onRow? : (r : Row) => void

    /**
     * Called when dropped on an existing column
     */
    onColumn? : (c : Column) => void

    /**
     * Called when dragging has stopped
     */
    onDragEnd? : () => void
}

/**
 * The "one-size-fits-all"-approach to shared state: A record
 * with loads of optional values.
 */
export interface PageDragEvent {
    origin : OriginFlag
    callbacks? : DropCallbacks
    row? : RowDescription
    queryRef? : ReferencedQuery
    widget? : WidgetDescription
}

/**
 * Shared state that is required to allow drag & drop operations
 * for the page editor.
 */
@Injectable()
export class DragService {

    private _currentDrag : PageDragEvent;

    /**
     * Starts a drag operation for the given scope.
     *
     * @param scope The scope that the dragged item matches.
     */
    private dragStart(evt : DragEvent, pageEvt : PageDragEvent) {
        // There can only be a single drag event at once
        if (this._currentDrag) {
            throw new Error ("Attempted to start a second drag");
        }

        this._currentDrag = pageEvt;

        // Serialize the dragged "thing"
        const dragData = JSON.stringify(this._currentDrag);
        evt.dataTransfer.setData('text/plain', dragData);

        // We are only interested in the top level drag element, if
        // we wouldn't stop the propagation, the parent of the current
        // drag element would fire another dragstart.
        evt.stopPropagation();

        // Controls how the mouse cursor looks when hovering over
        // allowed targets.
        if (pageEvt.origin == "sidebar") {
            evt.dataTransfer.effectAllowed = 'copy';
        } else {
            evt.dataTransfer.effectAllowed = 'move';
        }

        // Reset everything once the operation has ended
        evt.target.addEventListener("dragend", () => {
            // Possibly inform listeners
            if (this.currentDrag.callbacks &&
                this.currentDrag.callbacks.onDragEnd) {
                this.currentDrag.callbacks.onDragEnd();
            }

            // And stop the drag
            this._currentDrag = null;
            console.log(`Page-Drag ended: ${dragData}`);
        });

        console.log(`Page-Drag started: ${dragData}`);
    }

    /**
     * Starts dragging a row
     *
     * @param evt The DragEvent that is provided by the browser?
     * @param origin Where did this drag start?
     * @param rowDesc How does the dragged row look like?
     * @param callbacks Which events could be fired?
     */
    startRowDrag(evt : DragEvent, origin : OriginFlag, rowDesc : RowDescription, callbacks? : DropCallbacks) {
        this.dragStart(evt, {
            origin : origin,
            row : rowDesc,
            callbacks : callbacks
        })
    }

    /**
     * Starts dragging a reference to a query.
     *
     * @param evt The DragEvent that is provided by the browser?
     * @param origin Where did this drag start?
     * @param rowDesc Which query should be referenced?
     * @param callbacks Which events could be fired?
     */
    startQueryRefDrag(evt : DragEvent, origin : OriginFlag, queryRef : ReferencedQuery, callbacks? : DropCallbacks) {
        this.dragStart(evt, {
            origin : origin,
            queryRef : queryRef,
            callbacks : callbacks
        });
    }

    startWidgetDrag(evt : DragEvent, origin : OriginFlag, widget : WidgetDescription, callbacks? : DropCallbacks) {
        this.dragStart(evt, {
            origin : origin,
            widget : widget,
            callbacks : callbacks,
        })
    }

    /**
     * @return The drag operation that is currently in progress
     */
    get currentDrag() {
        return (this._currentDrag);
    }

    /**
     * @return The active origin flag, if any origin is present
     */
    get activeOrigin() : OriginFlag {
        return (this._currentDrag && this._currentDrag.origin);
    }

    /**
     * @return True, if currently a row is being dragged
     */
    get activeRow() : RowDescription {
        return (this._currentDrag && this._currentDrag.row)
    }
}
