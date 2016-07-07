import {Component, Inject, OnInit} from '@angular/core'

import {Heading}                  from '../../../shared/page/widgets/index'

import {SidebarService}           from '../../sidebar.service'
import {SIDEBAR_MODEL_TOKEN}      from '../../sidebar.token'

import {WidgetComponent}          from './widget.component'
import {
    HEADING_SIDEBAR_IDENTIFIER, HeadingSidebarComponent
} from './heading.sidebar.component'

export {Heading}

@Component({
    templateUrl: 'app/editor/page/widgets/templates/heading.html',
    selector: "esqulino-heading"
})
export class HeadingComponent extends WidgetComponent<Heading> {    
    constructor(@Inject(SidebarService) sidebarService : SidebarService,
                @Inject(SIDEBAR_MODEL_TOKEN) model : Heading) {
        super(sidebarService, model, {
            id: HEADING_SIDEBAR_IDENTIFIER,
            type : HeadingSidebarComponent
        });
    }
}
