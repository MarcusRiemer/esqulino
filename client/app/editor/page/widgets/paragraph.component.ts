import {Component, Inject, OnInit}    from '@angular/core'

import {Paragraph}                    from '../../../shared/page/widgets/index'

import {SidebarService}               from '../../sidebar.service'
import {WIDGET_MODEL_TOKEN}           from '../../editor.token'

import {WidgetComponent}              from './widget.component'
import {
    PARAGRAPH_SIDEBAR_IDENTIFIER, ParagraphSidebarComponent
} from './paragraph.sidebar.component'

export {Paragraph}

@Component({
    templateUrl: 'app/editor/page/widgets/templates/paragraph.html',
    selector: "esqulino-paragraph"
})
export class ParagraphComponent extends WidgetComponent<Paragraph> {
    
    constructor(@Inject(SidebarService) sidebarService : SidebarService,
                @Inject(WIDGET_MODEL_TOKEN) model : Paragraph) {
        super(sidebarService, model, {
            id : PARAGRAPH_SIDEBAR_IDENTIFIER,
            type : ParagraphSidebarComponent
        });
    }
}
