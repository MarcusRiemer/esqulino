import {Component, Input, OnInit} from '@angular/core'

import {Paragraph}                from '../../../shared/page/widgets/index'

import {SidebarService}           from '../../sidebar.service'

import {WidgetComponent}          from './widget.component'

@Component({
    templateUrl: 'app/editor/page/widgets/templates/paragraph.html',
    selector: "esqulino-paragraph",
    inputs: ["model"]
})
export class ParagraphComponent extends WidgetComponent<Paragraph> {
    /**
     * This ID is used to register this sidebar with the sidebar loader
     */
    static get SIDEBAR_IDENTIFIER() { return "page-paragraph" };

    constructor(_sidebarService : SidebarService) {
        super(_sidebarService);
    }
}
