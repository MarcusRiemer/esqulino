import {Component, Inject, OnInit} from '@angular/core'

import {Select}                    from '../../../../shared/page/widgets/index'

import {WIDGET_MODEL_TOKEN}        from '../../../editor.token'

/**
 * Allows to edit a <select> widget
 */
@Component({
    templateUrl: 'app/editor/page/tree/widgets/templates/select.html',
})
export class SelectComponent {    
    constructor(@Inject(WIDGET_MODEL_TOKEN) public model : Select) {

    }
}
