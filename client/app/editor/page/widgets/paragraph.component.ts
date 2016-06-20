import {Component, Input, OnInit} from '@angular/core'

import {WidgetComponent}          from './widget.component'

import {Paragraph}                from '../../../shared/page/widgets/index'

@Component({
    templateUrl: 'app/editor/page/widgets/templates/paragraph.html',
    selector: "esqulino-paragraph"
})
export class ParagraphComponent<Paragraph> {
    /**
     * This ID is used to register this sidebar with the sidebar loader
     */
    public static get SIDEBAR_IDENTIFIER() { return "page-paragraph" };
    
}
