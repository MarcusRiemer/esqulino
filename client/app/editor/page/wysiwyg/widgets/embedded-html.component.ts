import {Component, Inject, OnInit}    from '@angular/core'

import {EmbeddedHtml}                 from '../../../../shared/page/widgets/index'

import {SidebarService}               from '../../../sidebar.service'
import {RegistrationService}          from '../../../registration.service'
import {WIDGET_MODEL_TOKEN}           from '../../../editor.token'

import {WidgetComponent}              from '../../widget.component'
import {
    EMBEDDED_HTML_SIDEBAR_COMPONENT, EmbeddedHtmlSidebarComponent
} from '../../sidebar/embedded-html.sidebar.component'

export {EmbeddedHtml}

@Component({
    templateUrl: 'app/editor/page/wysiwyg/widgets/templates/embedded-html.html',
    selector: "esqulino-embedded-html"
})
export class EmbeddedHtmlComponent extends WidgetComponent<EmbeddedHtml> {
    
    constructor(sidebarService : SidebarService,
                registrationService : RegistrationService,
                @Inject(WIDGET_MODEL_TOKEN) model : EmbeddedHtml) {
        super(sidebarService, model, {
            reg : {
                typeId: EMBEDDED_HTML_SIDEBAR_COMPONENT,
                componentType : EmbeddedHtmlSidebarComponent
            },
            registrationService : registrationService
        });
    }
}
