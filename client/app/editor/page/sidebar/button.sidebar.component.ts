import {Component, Inject, Optional}   from '@angular/core'

import {Button, QueryAction}           from '../../../shared/page/widgets/index'

import {SIDEBAR_MODEL_TOKEN}           from '../../editor.token'

import {WidgetComponent}               from '../widget.component'

type Component = WidgetComponent<Button>

/**
 * Displays the sidebar editing component for a heading.
 */
@Component({
    templateUrl: 'app/editor/page/sidebar/templates/button-sidebar.html',
})
export class ButtonSidebarComponent {

    private _component : Component;

    constructor(@Inject(SIDEBAR_MODEL_TOKEN) com : Component) {
        this._component = com;
    }

    get queryName() {
        return (this.model.action && this.model.action.queryName);
    }

    set queryName(value : string) {
        this.model.action = new QueryAction(this.model, {
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

