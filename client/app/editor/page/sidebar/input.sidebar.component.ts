import {Component, Inject, Optional}   from '@angular/core'

import {Input}                         from '../../../shared/page/widgets/index'

import {SIDEBAR_MODEL_TOKEN}           from '../../editor.token'

import {WidgetComponent}               from '../widget.component'

type Component = WidgetComponent<Input>

/**
 * Displays the sidebar editing component for a heading.
 */
@Component({
    templateUrl: 'app/editor/page/sidebar/templates/input-sidebar.html',
})
export class InputSidebarComponent {

    private _component : Component;

    constructor(@Inject(SIDEBAR_MODEL_TOKEN) com : Component) {
        this._component = com;
    }
    
    /**
     * The model that is worked on.
     */
    get model() {
        return (this._component.model);
    }
}

export const INPUT_SIDEBAR_IDENTIFIER = "page-input";

