import {
    Component, Input, Output, EventEmitter,
    OnChanges, SimpleChanges, OnInit
} from "@angular/core"

import {Page, ParameterMapping}               from '../../../../../shared/page/index'

import {PageDragEvent}                        from '../../../drag.service'

@Component({
    selector: `required-parameters`,
    templateUrl: 'app/editor/page/tree/widgets/helper/templates/required-parameters.html',
})
export class RequiredParametersComponent implements OnInit {
    @Input() parameterMapping : ParameterMapping[];

    @Output() parameterMappingChange = new EventEmitter();

    @Input() page : Page;

    /**
     * Ensures all inputs are wired.
     */
    ngOnInit() {
        console.log(this.parameterMapping.map(p => p.toModel()));
    }

    get hasParameters() : boolean {
        return (this.parameterMapping && this.parameterMapping.length > 0);
    }

    getDisplayText(mapping : ParameterMapping) {
        if (mapping.isSatisfied) {
            return (mapping.providingName);
        } else {
            return (mapping.parameterName);
        }
    }

    /**
     * Something is being dragged over this query reference.
     */
    onDragOver(event : DragEvent, mapping : ParameterMapping) {
        const dragEvent = JSON.parse(event.dataTransfer.getData("text/plain")) as PageDragEvent;

        if (dragEvent.parameterValueProvider) {
            event.preventDefault();
        }
    }

    /**
     * Something has been dropped on this query reference.
     */
    onDrop(event : DragEvent, mapping : ParameterMapping) {
        event.stopPropagation();
        
        const dragText = event.dataTransfer.getData("text/plain");
        const dragEvent = JSON.parse(dragText) as PageDragEvent;

        if (dragEvent.parameterValueProvider) {
            event.preventDefault();

            const value = dragEvent.parameterValueProvider;
            mapping.providingName = value;

            this.parameterMappingChange.emit(this.parameterMapping);

            console.log(`Parameter ${mapping.parameterName}: Dropped "${value}"`);
        }
    }
}
