import {Component, Inject, Optional}        from '@angular/core'

import {SIDEBAR_MODEL_TOKEN}                from '../../sidebar.token'

import {HeadingComponent, Heading}          from './heading.component'

@Component({
    templateUrl: 'app/editor/page/widgets/templates/heading-sidebar.html',
})
export class HeadingSidebarComponent {

    private _model : Heading;
    
    constructor(@Inject(SIDEBAR_MODEL_TOKEN) model : Heading) {
        this._model = model;
    }

    get model() {
        return (this._model);
    }
}

export const HEADING_SIDEBAR_IDENTIFIER = "page-heading";

