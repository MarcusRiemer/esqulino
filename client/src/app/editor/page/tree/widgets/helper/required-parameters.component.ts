import {
    Component, Input, Output, EventEmitter,
    OnChanges, SimpleChanges, OnInit
} from "@angular/core"

import {Page, ParameterMapping}               from '../../../../../shared/page/index'

import {PageDragEvent}                        from '../../../drag.service'

/**
 * Wraps assignment of parameters that are required to do something.
 */
@Component({
    selector: `required-parameters`,
    templateUrl: 'templates/required-parameters.html',
})
export class RequiredParametersComponent {
    @Input() parameterMapping : ParameterMapping[];

    @Output() parameterMappingChange = new EventEmitter();

    @Input() page : Page;

    /**
     * @return True, if there is any parameter that is actually used.
     */
    get hasParameters() : boolean {
        return (this.parameterMapping && this.parameterMapping.length > 0);
    }

    /**
     * @return Either the required or the mapped name.
     */
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
