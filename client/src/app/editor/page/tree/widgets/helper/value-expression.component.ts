import {Component,
        Input, Output, EventEmitter}      from '@angular/core'

import {
    Page,
    QueryReference, QueryReferenceDescription
} from '../../../../../shared/page/index'


import {DragService}                      from '../../../../page/drag.service'

/**
 * A single value, effectively something that should be expressed with the
 * {{ }} syntax of liquid.
 */
@Component({
    selector: `value-expression`,
    templateUrl: 'templates/value-expression.html',
})
export class ValueExpressionComponent {
    /**
     * A repeating query that could provide a column as the value.
     */
    @Input() repeatingQuery : QueryReference;

    /**
     * The name of the referenced column.
     */
    @Input() columnName : string;

    constructor(private _dragService : DragService) {

    }
}
