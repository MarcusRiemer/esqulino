import {Component, Inject, Optional}        from '@angular/core'

import {EmbeddedHtml}                       from '../../../../shared/page/widgets/index'

import {SIDEBAR_MODEL_TOKEN}                from '../../../editor.token'

import {EmbeddedHtmlComponent}              from './embedded-html.component'

@Component({
    templateUrl: 'app/editor/page/wysiwyg/widgets/templates/embedded-html-sidebar.html',
})
export class EmbeddedHtmlSidebarComponent {

    private _com : EmbeddedHtmlComponent;
    
    constructor(@Inject(SIDEBAR_MODEL_TOKEN) com : EmbeddedHtmlComponent) {
        this._com = com;
    }

    get model() {
        return (this._com.model);
    }
}

export const EMBEDDED_HTML_SIDEBAR_COMPONENT = "embedded-html";

