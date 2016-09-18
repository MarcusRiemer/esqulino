import {Component, Inject, Optional}   from '@angular/core'

import {EmbeddedHtml}                  from '../../../shared/page/widgets/index'

import {SIDEBAR_MODEL_TOKEN}           from '../../editor.token'

import {WidgetComponent}               from '../widget.component'

type EditedComponent = WidgetComponent<EmbeddedHtml>

@Component({
    templateUrl: 'app/editor/page/sidebar/templates/embedded-html-sidebar.html',
})
export class EmbeddedHtmlSidebarComponent {

    private _com : EditedComponent;
    
    constructor(@Inject(SIDEBAR_MODEL_TOKEN) com : EditedComponent) {
        this._com = com;
    }

    get model() {
        return (this._com.model);
    }
}

export const EMBEDDED_HTML_SIDEBAR_COMPONENT = "page-embedded-html";

export const EMBEDDED_HTML_REGISTRATION = {
    typeId : EMBEDDED_HTML_SIDEBAR_COMPONENT,
    componentType : EmbeddedHtmlSidebarComponent
}
