import {Component, Inject, Optional}        from '@angular/core'

import {SIDEBAR_MODEL_TOKEN}                from '../../sidebar.token'

import {Paragraph}                          from '../../../shared/page/widgets/index'

@Component({
    templateUrl: 'app/editor/page/widgets/templates/paragraph-sidebar.html',
})
export class ParagraphSidebarComponent {

    private _model : Paragraph;
    
    constructor(@Inject(SIDEBAR_MODEL_TOKEN) model : Paragraph) {
        this._model = model;
    }

    get model() {
        return (this._model);
    }
    
    /*constructor(@Optional() private _paragraph : ParagraphComponent) {
        console.log(`Model for ${_paragraph.model.text}`);
    }*/
}

export const PARAGRAPH_SIDEBAR_IDENTIFIER = "page-paragraph";

