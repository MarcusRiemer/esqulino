import {Component, Inject, Optional}        from '@angular/core'

import {SIDEBAR_MODEL_TOKEN}                from '../../editor.token'

import {
    ButtonComponent, Button, QueryAction
} from './button.component'

/**
 * Displays the sidebar editing component for a heading.
 */
@Component({
    templateUrl: 'app/editor/page/widgets/templates/button-sidebar.html',
})
export class ButtonSidebarComponent {

    private _component : ButtonComponent;

    constructor(@Inject(SIDEBAR_MODEL_TOKEN) com : ButtonComponent) {
        this._component = com;
    }

    get queryName() {
        return (this.model.action && this.model.action.queryName);
    }

    set queryName(value : string) {
        this.model.action = new QueryAction(this.model, {
            mapping : [],
            queryName : value,
            type : "query"
        });
    }

    get availableQueries() {
        return (this.model.page.referencedQueries)
    }

    /**
     * The model that is worked on.
     */
    get model() {
        return (this._component.model);
    }
}

export const BUTTON_SIDEBAR_IDENTIFIER = "page-button";

