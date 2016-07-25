import {Component, Inject, Optional}        from '@angular/core'

import {SIDEBAR_MODEL_TOKEN}                from '../../editor.token'

import {InputComponent, Input}              from './input.component'

/**
 * Displays the sidebar editing component for a heading.
 */
@Component({
    templateUrl: 'app/editor/page/widgets/templates/input-sidebar.html',
})
export class InputSidebarComponent {

    private _component : InputComponent;

    constructor(@Inject(SIDEBAR_MODEL_TOKEN) com : InputComponent) {
        this._component = com;
    }
    
    /**
     * The model that is worked on.
     */
    get model() {
        return (this._component.model);
    }

    get component() {
        return (this._component);
    }
}

export const INPUT_SIDEBAR_IDENTIFIER = "page-input";

