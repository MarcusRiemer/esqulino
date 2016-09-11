import {Component,
        Input, Output, EventEmitter}      from '@angular/core'

import {DragService}                      from '../../../../page/drag.service'

@Component({
    selector: `provided-parameter`,
    templateUrl: 'app/editor/page/tree/widgets/helper/templates/provided-parameter.html',
})
export class ProvidedParameterComponent {
    @Input() parameterName : string;

    constructor(private _dragService : DragService) {

    }
    
    /**
     * Starts dragging the provided parameter.
     */
    onParameterDragStart(event : DragEvent) {
        this._dragService.startValueDrag(event, "sidebar", this.parameterName);
    }
}
