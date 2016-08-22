import {Component, Inject, OnInit} from '@angular/core'

import {EmbeddedHtml}              from '../../../../shared/page/widgets/index'

import {WIDGET_MODEL_TOKEN}        from '../../../editor.token'

export {EmbeddedHtml}

@Component({
    templateUrl: 'app/editor/page/tree/widgets/templates/embedded-html.html',
})
export class EmbeddedHtmlComponent {    
    constructor(@Inject(WIDGET_MODEL_TOKEN) public model : EmbeddedHtml) {

    }
}
