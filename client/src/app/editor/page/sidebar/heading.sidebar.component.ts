import {Component, Inject, Optional}   from '@angular/core'

import {Heading}                       from '../../../shared/page/widgets/index'

import {SIDEBAR_MODEL_TOKEN}           from '../../editor.token'

import {WidgetComponent}               from '../widget.component'

/**
 * Displays the sidebar editing component for a heading.
 */
@Component({
    templateUrl: 'templates/heading-sidebar.html',
})
export class HeadingSidebarComponent {

    private _model : Heading;

    constructor(@Inject(SIDEBAR_MODEL_TOKEN) com : WidgetComponent<Heading>) {
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

export const HEADING_REGISTRATION = {
    typeId : HEADING_SIDEBAR_IDENTIFIER,
    componentType : HeadingSidebarComponent
}
