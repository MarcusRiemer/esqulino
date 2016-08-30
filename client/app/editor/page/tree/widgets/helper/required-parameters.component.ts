import {
    Component, Input, Output, EventEmitter,
    OnChanges, SimpleChanges, OnInit
} from "@angular/core"

import {Page, ParameterMapping}               from '../../../../../shared/page/index'

import {PageDragEvent}                        from '../../../drag.service'

@Component({
    selector: `required-parameters`,
    templateUrl: 'app/editor/page/tree/widgets/helper/templates/query-reference.html',
})
export class RequiredParametersComponent implements OnInit {
    @Input() parameterMapping : ParameterMapping[];

    @Output() parameterMappingChange = new EventEmitter();

    @Input() page : Page;

    /**
     * Ensures all inputs are wired.
     */
    ngOnInit() {
        if (!this.page) {
            throw new Error("ActionReferenceComponent without page");
        }
    }

    /**
     * Something is being dragged over this query reference.
     */
    onDragOver(event : DragEvent) {
        /*const dragEvent = JSON.parse(event.dataTransfer.getData("text/plain")) as PageDragEvent;

        if (dragEvent.queryRef) {
            event.preventDefault();
        }*/
    }

    /**
     * Something has been dropped on this query reference.
     */
    onDrop(event : DragEvent) {
        /*event.stopPropagation();
        
        const dragText = event.dataTransfer.getData("text/plain");
        const dragEvent = JSON.parse(dragText) as PageDragEvent;

        if (dragEvent.queryRef) {
            event.preventDefault();

            const newName = dragEvent.queryRef.name;
            this.actionReferenceName = newName;
            this.actionReferenceNameChange.emit(newName);

            console.log(`Query Reference: Dropped "${this.actionReference.queryName}"`);
        }*/
    }
}
