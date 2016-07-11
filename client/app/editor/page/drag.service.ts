import {Subject}                from 'rxjs/Subject'

import {Injectable}             from '@angular/core'

export type OriginFlag = "sidebar" | "page"

export interface PageDragEvent {
    origin : OriginFlag
    row? : boolean
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
            this._currentDrag = null;
            console.log(`Page-Drag ended: ${dragData}`);
        });

        console.log(`Page-Drag started: ${dragData}`);
    }

    startRowDrag(origin : OriginFlag, evt : DragEvent) {
        this.dragStart(evt, {
            origin : origin,
            row : true
        })
    }

    get activeRow() {
        return (this._currentDrag && this._currentDrag.row)
    }
}
