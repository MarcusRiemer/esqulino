import {Component, Inject, Optional}        from '@angular/core'

import {WIDGET_MODEL_TOKEN}                 from '../../sidebar.token'

import {HeadingComponent, Heading}          from './heading.component'

/**
 * Displays the sidebar editing component for a heading.
 */
@Component({
    templateUrl: 'app/editor/page/widgets/templates/heading-sidebar.html',
})
export class HeadingSidebarComponent {

    private _model : Heading;

    constructor(@Inject(WIDGET_MODEL_TOKEN) com : HeadingComponent) {
        this._model = com.model;
    }

    /**
     * The model that is worked on.
     */
    get model() {
        return (this._model);
    }
}

export const HEADING_SIDEBAR_IDENTIFIER = "page-heading";

