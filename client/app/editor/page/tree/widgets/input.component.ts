import {Component, Inject, OnInit} from '@angular/core'

import {Input}                     from '../../../../shared/page/widgets/index'

import {DragService}               from '../../../page/drag.service'

import {WIDGET_MODEL_TOKEN}        from '../../../editor.token'

/**
 * Tree-node-editor for <input>-widgets. Provides an input parameter for
 * other widgets.
 */
@Component({
    templateUrl: 'app/editor/page/tree/widgets/templates/input.html',
})
export class InputComponent {    
    constructor(@Inject(WIDGET_MODEL_TOKEN) public model : Input,
                private _dragService : DragService) {

    }

    /**
     * Starts dragging the provided parameter.
     */
    onParameterDragStart(event : DragEvent) {
        const value = this.model.outParamName;
        this._dragService.startValueDrag(event, "sidebar", value);
    }
}
