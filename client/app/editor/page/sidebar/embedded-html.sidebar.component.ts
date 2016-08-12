import {Component, Inject, Optional}   from '@angular/core'

import {EmbeddedHtml}                  from '../../../shared/page/widgets/index'

import {SIDEBAR_MODEL_TOKEN}           from '../../editor.token'
import {SidebarItemHost}               from '../../sidebar-item-host.component'

import {WidgetComponent}               from '../widget.component'

type Component = WidgetComponent<EmbeddedHtml>

@Component({
    templateUrl: 'app/editor/page/sidebar/templates/embedded-html-sidebar.html',
    directives : [SidebarItemHost]
})
export class EmbeddedHtmlSidebarComponent {

    private _com : Component;
    
    constructor(@Inject(SIDEBAR_MODEL_TOKEN) com : Component) {
        this._com = com;
    }

    get model() {
        return (this._com.model);
    }
}

export const EMBEDDED_HTML_SIDEBAR_COMPONENT = "embedded-html";

