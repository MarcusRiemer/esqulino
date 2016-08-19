import {Component, Inject, OnInit} from '@angular/core'

import {Heading}                  from '../../../../shared/page/widgets/index'

import {SidebarService}           from '../../../sidebar.service'
import {RegistrationService}      from '../../../registration.service'
import {WIDGET_MODEL_TOKEN}       from '../../../editor.token'

import {WidgetComponent}          from '../../widget.component'

export {Heading}

@Component({
    templateUrl: 'app/editor/page/tree/widgets/templates/heading.html',
})
export class HeadingComponent {    
    constructor(@Inject(WIDGET_MODEL_TOKEN) public model : Heading) {

    }
}
