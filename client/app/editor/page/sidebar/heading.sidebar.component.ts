import {Component, Inject, Optional}   from '@angular/core'

import {Heading}                       from '../../../shared/page/widgets/index'

import {SIDEBAR_MODEL_TOKEN}           from '../../editor.token'
import {SidebarItemHost}               from '../../sidebar-item-host.component'

import {WidgetComponent}               from '../widget.component'

type Component = WidgetComponent<Heading>

/**
 * Displays the sidebar editing component for a heading.
 */
@Component({
    templateUrl: 'app/editor/page/sidebar/templates/heading-sidebar.html',
    directives : [SidebarItemHost]
})
export class HeadingSidebarComponent {

    private _model : Heading;

    constructor(@Inject(SIDEBAR_MODEL_TOKEN) com : Component) {
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

