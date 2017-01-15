import {
    Component, Input, Output, EventEmitter,
    OnChanges, SimpleChanges
} from "@angular/core"

import {
    Page,
    QueryReference, QueryReferenceDescription
} from '../../../../../shared/page/index'
import{
    QuerySelect, ResultColumn
} from '../../../../../shared/query'

import {
    PageDragEvent, DragService
} from '../../../drag.service'

/**
 * Allows editing of query references.
 */
@Component({
    selector: `query-reference`,
    templateUrl: 'templates/query-reference.html',
})
export class QueryReferenceComponent {
    @Input() queryReference : QueryReference;
    @Output() queryReferenceChange = new EventEmitter();

    @Output() queryReferenceNameChange = new EventEmitter();
    
    /**
     * Should this query reference be always bound to the references
     * that are available on a certain page?
     *
     * If set to true, these references will never be actually edited
     * but always replaced with entirely different references.
     */
    @Input() restrictToPage : Page;

    constructor(private _dragService : DragService) {
    }

    /**
     * @return The text that should be displayed.
     */
    get text() {
        if (this.queryReference &&  this.queryReference.displayName) {
            return (this.queryReference.displayName);
        } else {
            return `<span class="fa fa-question-circle"></span>`;
        }
    }

    /**
     * @return True, if this is a valid reference
     */
    get isValidReference() {
        return (this.queryReference &&
                this.queryReference.isResolveable);
    }

    /**
     * The query reference is about to be dragged, possibly on the
     * trash.
     */
    onDragStart(event : DragEvent) {
        this._dragService.startQueryRefDrag(event, "page", this.queryReference.toModel(), {
            onRemove : () => this.queryReference.clear()
        });
    }

    /**
     * Something is being dragged over this query reference.
     */
    onDragOver(event : DragEvent) {
        const dragEvent = JSON.parse(event.dataTransfer.getData("text/plain")) as PageDragEvent;

        if (dragEvent.queryRef) {
            event.preventDefault();
        }
    }

    /**
     * Something has been dropped on this query reference.
     */
    onDrop(event : DragEvent) {
        event.stopPropagation();
        
        const dragText = event.dataTransfer.getData("text/plain");
        const dragEvent = JSON.parse(dragText) as PageDragEvent;

        if (dragEvent.queryRef) {
            event.preventDefault();

            const newRef = dragEvent.queryRef;
            const page = this.restrictToPage;

            // Should the reference itself be left intact?
            if (this.restrictToPage) {
                // Yes, grab the correct page reference without actually modifying any
                // existing reference. Its just the reference to the reference that is
                // changed.
                const pageRef = this.restrictToPage.getQueryReferenceByName(newRef.name);
                if (pageRef) {
                    this.queryReference = pageRef;
                } else {
                    throw new Error(`Attempted to set reference unknown to the page: ${newRef.name}`);
                }
            } else {
                // No, update the whole reference with the drag data
                this.queryReference = new QueryReference(page, newRef);
            }
            
            this.queryReferenceChange.emit(this.queryReference);
            this.queryReferenceNameChange.emit(this.queryReference.name);
            const newDspName = this.queryReference.displayName;

            console.log(`Query Reference: Dropped, now pointing to ${newDspName}"`);
        }
    }
}
