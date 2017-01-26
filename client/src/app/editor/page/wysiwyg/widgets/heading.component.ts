import {Component, Inject, OnInit} from '@angular/core'

import {Heading}                  from '../../../../shared/page/widgets/index'

import {SidebarService}           from '../../../sidebar.service'
import {RegistrationService}      from '../../../registration.service'
import {WIDGET_MODEL_TOKEN}       from '../../../editor.token'

import {WidgetComponent}          from '../../widget.component'

export {Heading}

@Component({
    templateUrl: 'templates/heading.html',
    selector: "esqulino-heading"
})
export class HeadingComponent extends WidgetComponent<Heading> {    
    constructor(sidebarService : SidebarService,
                registrationService : RegistrationService,
                @Inject(WIDGET_MODEL_TOKEN) model : Heading) {
        super(sidebarService, model);
    }
}
