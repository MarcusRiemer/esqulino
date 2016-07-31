import {Component, Inject, OnInit}    from '@angular/core'

import {EmbeddedHtml}                 from '../../../shared/page/widgets/index'

import {SidebarService}               from '../../sidebar.service'
import {WIDGET_MODEL_TOKEN}           from '../../editor.token'

import {WidgetComponent}              from './widget.component'
import {
    EMBEDDED_HTML_SIDEBAR_COMPONENT, EmbeddedHtmlSidebarComponent
} from './embedded-html.sidebar.component'

export {EmbeddedHtml}

@Component({
    templateUrl: 'app/editor/page/widgets/templates/embedded-html.html',
    selector: "esqulino-embedded-html"
})
export class EmbeddedHtmlComponent extends WidgetComponent<EmbeddedHtml> {
    
    constructor(@Inject(SidebarService) sidebarService : SidebarService,
                @Inject(WIDGET_MODEL_TOKEN) model : EmbeddedHtml) {
        super(sidebarService, model, {
            id : EMBEDDED_HTML_SIDEBAR_COMPONENT,
            type : EmbeddedHtmlSidebarComponent
        });
    }
}
