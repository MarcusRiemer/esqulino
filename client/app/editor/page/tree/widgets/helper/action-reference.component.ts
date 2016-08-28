import {
    Component, Input, Output, EventEmitter,
    OnChanges, SimpleChanges, OnInit
} from "@angular/core"

import {Page}                                 from '../../../../../shared/page/index'
import {QueryAction, QueryActionDescription}  from '../../../../../shared/page/widgets/action'

import {PageDragEvent}                        from '../../../drag.service'

@Component({
    selector: `action-reference`,
    templateUrl: 'app/editor/page/tree/widgets/helper/templates/query-reference.html',
})
export class ActionReferenceComponent implements OnInit {
    @Input() actionReferenceName : string;

    @Output() actionReferenceNameChange = new EventEmitter();

    @Input() page : Page;

    /**
     * Ensures all inputs are wired.
     */
    ngOnInit() {
        if (!this.page) {
            throw new Error("ActionReferenceComponent without page");
        }
    }

    get actionReference() : QueryAction {
        return (undefined);
        // this.page.getQueryReferenceByName(this.actionReferenceName);
    }

    /**
     * @return The text that should be displayed.
     */
    get text() {
        if (this.actionReference) {
            return (this.actionReference.queryName);
        } else {
            return `<span class="fa fa-question-circle"></span>`;
        }
    }

    /**
     * @return True, if this is a valid reference
     */
    get isValidReference() {
        return (this.actionReference &&
                this.page.usesQueryReferenceByName(this.actionReference.queryName) &&
                this.actionReference.queryReference.isResolveable);
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
            this.actionReferenceName = newName;
            this.actionReferenceNameChange.emit(newName);

            console.log(`Query Reference: Dropped "${this.actionReference.queryName}"`);
        }
    }
}
