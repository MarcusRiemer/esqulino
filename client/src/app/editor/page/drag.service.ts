import {Subject}                from 'rxjs/Subject'

import {Injectable}             from '@angular/core'

import {TrashService}           from '../shared/trash.service'

import {
    Column, Row, RowDescription, WidgetDescription, WidgetBase, WidgetHost, 
    QueryReferenceDescription, ValueReferenceDescription, ColumnReferenceDescription
} from '../../shared/page/widgets/index'

import {
    Page, ParameterMapping, ParameterMappingDescription
} from '../../shared/page/page'

export interface DragColumnDescription {
    columnName : string,

    queryName : string
}

/**
 * Hints about the origin of a drag operation
 */
export type OriginFlag = "sidebar" | "page"

/**
 * Possible callbacks for drop operations.
 */
export interface DropCallbacks {
    /**
     * Called when dropped into the trash
     */
    onRemove? : () => void

    /**
     * Called when dropped on a widget
     */
    onWidget? : (w : WidgetHost) => void

    /**
     * Dropped on a parameter mapping
     */
    onParameterMapping? : (p : ParameterMapping) => void

    /**
     * Called when dragging has stopped
     */
    onDragEnd? : () => void
}

/**
 * The "one-size-fits-all"-approach to shared state: A record
 * with loads of optional values.
 */
export class PageDragEvent {
    origin : OriginFlag
    callbacks? : DropCallbacks
    queryRef? : QueryReferenceDescription
    widget? : WidgetDescription
    parameterValueProvider? : string
    columnRef? : DragColumnDescription
    
    get row() : RowDescription {
        if (this.widget && this.widget.type === "row") {
            return (this.widget as RowDescription);
        } else {
            return (undefined);
        }
    }
}

/**
 * Shared state that is required to allow drag & drop operations
 * for the page editor.
 */
@Injectable()
export class DragService {

    private _currentDrag : PageDragEvent;

    constructor(private _trashService : TrashService) {

    }
    
    /**
     * Starts a drag operation for the given scope.
     *
     * @param scope The scope that the dragged item matches.
     */
    private dragStart(evt : DragEvent,
                      pageEvt : PageDragEvent) {
        // There can only be a single drag event at once
        if (this._currentDrag) {
            throw new Error ("Attempted to start a second drag");
        }

        // Remember the drag for later operations
        this._currentDrag = pageEvt;

        // If there is no callback object at all, provide at least an
        // "empty" substitute so callers everywhere don't need to check
        // for undefined values.
        if (!this._currentDrag.callbacks) {
            this._currentDrag.callbacks = {}
        }

        // Need for removal?
        if (this._currentDrag.callbacks.onRemove) {
            this._trashService.showTrash(_ => {
                this._currentDrag.callbacks.onRemove();
            });
        }
        
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
            this._currentDrag = undefined;
            this._trashService.hideTrash();
            console.log(`Page-Drag ended: ${dragData}`);
        });

        console.log(`Page-Drag started: ${dragData}`);
    }

    /**
     * Starts dragging a reference to a query.
     *
     * @param evt The DragEvent that is provided by the browser?
     * @param origin Where did this drag start?
     * @param rowDesc Which query should be referenced?
     * @param callbacks Which events could be fired?
     */
    startQueryRefDrag(evt : DragEvent,
                      origin : OriginFlag,
                      queryRef : QueryReferenceDescription,
                      callbacks? : DropCallbacks) {
        this.dragStart(evt, {
            origin : origin,
            queryRef : queryRef,
            callbacks : callbacks,
            row : undefined
        });
    }

    /**
     * Starts dragging a reference to a column.
     *
     * @param evt The DragEvent that is provided by the browser?
     * @param origin Where did this drag start?
     * @param rowDesc Which query should be referenced?
     * @param callbacks Which events could be fired?
     */
    startColumnRefDrag(evt : DragEvent,
                       origin : OriginFlag,
                       columnRef : DragColumnDescription,
                       callbacks? : DropCallbacks) {
        this.dragStart(evt, {
            origin : origin,
            columnRef : columnRef,
            callbacks : callbacks,
            row : undefined
        });
    }

    /**
     * Starts dragging a widget that could be constructed when dropped.
     *
     * @param evt The DragEvent that is provided by the browser?
     * @param origin Where did this drag start?
     * @param widget The widget to drag
     * @param callbacks Which events could be fired?
     */
    startWidgetDrag(evt : DragEvent,
                    origin : OriginFlag,
                    widget : WidgetDescription,
                    callbacks? : DropCallbacks) {
        this.dragStart(evt, {
            origin : origin,
            widget : widget,
            callbacks : callbacks,
            row : undefined
        })
    }

    /**
     * Starts dragging a value-reference that can be used in a parameter mapping.
     */
    startValueDrag(evt : DragEvent,
                   origin : OriginFlag,
                   valueProviderName : string,
                   callbacks? : DropCallbacks) {
        this.dragStart(evt, {
            origin : origin,
            parameterValueProvider : valueProviderName,
            callbacks : callbacks,
            row : undefined
        });
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
    get activeOrigin() : OriginFlag | "" {
        return (this._currentDrag && this._currentDrag.origin)
    }

    /**
     * @return True, if currently a row is being dragged
     */
    get activeRow() : RowDescription {
        return (this._currentDrag && this._currentDrag.row)
    }
}
