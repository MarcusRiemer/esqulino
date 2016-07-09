import {Component, Inject, Optional}        from '@angular/core'

import {Paragraph}                          from '../../../shared/page/widgets/index'

import {SIDEBAR_MODEL_TOKEN}                from '../../sidebar.token'

import {ParagraphComponent}                 from './paragraph.component'

@Component({
    templateUrl: 'app/editor/page/widgets/templates/paragraph-sidebar.html',
})
export class ParagraphSidebarComponent {

    private _model : Paragraph;
    
    constructor(@Inject(SIDEBAR_MODEL_TOKEN) com : ParagraphComponent) {
        this._model = com.model;
    }

    get model() {
        return (this._model);
    }
}

export const PARAGRAPH_SIDEBAR_IDENTIFIER = "page-paragraph";

