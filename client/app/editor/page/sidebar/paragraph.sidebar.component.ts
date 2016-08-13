import {Component, Inject, Optional}   from '@angular/core'

import {Paragraph}                     from '../../../shared/page/widgets/index'

import {
    SIDEBAR_MODEL_TOKEN, SIDEBAR_ID_TOKEN
} from '../../editor.token'

import {WidgetComponent}               from '../widget.component'

type Component = WidgetComponent<Paragraph>

@Component({
    templateUrl: 'app/editor/page/sidebar/templates/paragraph-sidebar.html',
})
export class ParagraphSidebarComponent {

    private _model : Paragraph;
    
    constructor(@Inject(SIDEBAR_MODEL_TOKEN) com : Component,
                @Inject(SIDEBAR_ID_TOKEN) public id : number) {
        this._model = com.model;
    }

    get model() {
        return (this._model);
    }
}

export const PARAGRAPH_SIDEBAR_IDENTIFIER = "page-paragraph";

