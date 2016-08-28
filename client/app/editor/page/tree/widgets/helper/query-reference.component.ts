import {
    Component, Input, Output, EventEmitter,
    OnChanges, SimpleChanges, OnInit
} from "@angular/core"

import {
    Page,
    QueryReference, QueryReferenceDescription
} from '../../../../../shared/page/index'
import{
    QuerySelect, ResultColumn
} from '../../../../../shared/query'

import {PageDragEvent}                        from '../../../drag.service'

@Component({
    selector: `query-reference`,
    templateUrl: 'app/editor/page/tree/widgets/helper/templates/query-reference.html',
})
export class QueryReferenceComponent implements OnInit {
    @Input() queryReferenceName : string;

    @Output() queryReferenceNameChange = new EventEmitter();

    @Input() page : Page;

    /**
     * Ensures all inputs are wired.
     */
    ngOnInit() {
        if (!this.queryReference) {
            throw new Error("QueryReferenceComponent without queryReference");
        }
        
        if (!this.page) {
            throw new Error("QueryReferenceComponent without page");
        }
    }

    get queryReference() : QueryReference {
        return (this.page.getQueryReferenceByName(this.queryReferenceName));
    }

    /**
     * @return The text that should be displayed.
     */
    get text() {
        if (this.queryReference) {
            return (this.queryReference.name);
        } else {
            return `<span class="fa fa-question-circle"></span>`;
        }
    }

    /**
     * @return True, if this is a valid reference
     */
    get isValidReference() {
        return (this.queryReference &&
                this.page.usesQueryReferenceByName(this.queryReference.name) &&
                this.queryReference.isResolveable &&
                this.queryReference.query instanceof QuerySelect);
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

            const newName = dragEvent.queryRef.name;
            this.queryReferenceName = newName;
            this.queryReferenceNameChange.emit(newName);

            console.log(`Query Reference: Dropped "${this.queryReferenceName}"`);
        }
    }
}
