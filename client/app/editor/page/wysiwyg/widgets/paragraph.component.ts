import {Component, Inject, OnInit}    from '@angular/core'

import {Paragraph}                    from '../../../../shared/page/widgets/index'

import {SidebarService}               from '../../../sidebar.service'
import {RegistrationService}          from '../../../registration.service'
import {WIDGET_MODEL_TOKEN}           from '../../../editor.token'

import {WidgetComponent}              from '../../widget.component'
import {
    PARAGRAPH_SIDEBAR_IDENTIFIER, ParagraphSidebarComponent
} from '../../sidebar/paragraph.sidebar.component'

export {Paragraph}

@Component({
    templateUrl: 'app/editor/page/wysiwyg/widgets/templates/paragraph.html',
    selector: "esqulino-paragraph"
})
export class ParagraphComponent extends WidgetComponent<Paragraph> {
    
    constructor(sidebarService : SidebarService,
                registrationService : RegistrationService,
                @Inject(WIDGET_MODEL_TOKEN) model : Paragraph) {
        super(sidebarService, model, {
            reg : {
                typeId: PARAGRAPH_SIDEBAR_IDENTIFIER,
                componentType : ParagraphSidebarComponent
            },
            registrationService : registrationService
        });
    }
}
