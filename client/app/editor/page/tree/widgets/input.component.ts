import {Component, Inject, OnInit} from '@angular/core'

import {Input}                    from '../../../../shared/page/widgets/index'

import {SidebarService}           from '../../../sidebar.service'
import {RegistrationService}      from '../../../registration.service'
import {WIDGET_MODEL_TOKEN}       from '../../../editor.token'

import {WidgetComponent}          from '../../widget.component'

@Component({
    templateUrl: 'app/editor/page/tree/widgets/templates/input.html',
})
export class InputComponent {    
    constructor(@Inject(WIDGET_MODEL_TOKEN) public model : Input) {

    }
}
