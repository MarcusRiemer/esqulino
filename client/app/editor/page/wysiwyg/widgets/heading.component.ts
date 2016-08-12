import {Component, Inject, OnInit} from '@angular/core'

import {Heading}                  from '../../../../shared/page/widgets/index'

import {SidebarService}           from '../../../sidebar.service'
import {WIDGET_MODEL_TOKEN}       from '../../../editor.token'

import {WidgetComponent}          from '../../widget.component'
import {
    HEADING_SIDEBAR_IDENTIFIER, HeadingSidebarComponent
} from '../../sidebar/heading.sidebar.component'

export {Heading}

@Component({
    templateUrl: 'app/editor/page/wysiwyg/widgets/templates/heading.html',
    selector: "esqulino-heading"
})
export class HeadingComponent extends WidgetComponent<Heading> {    
    constructor(@Inject(SidebarService) sidebarService : SidebarService,
                @Inject(WIDGET_MODEL_TOKEN) model : Heading) {
        super(sidebarService, model, {
            id: HEADING_SIDEBAR_IDENTIFIER,
            type : HeadingSidebarComponent
        });
    }
}
