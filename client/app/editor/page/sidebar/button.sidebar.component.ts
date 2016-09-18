import {Component, Inject, Optional}   from '@angular/core'

import {QuerySelect}                   from '../../../shared/query'
import {QueryReference}                from '../../../shared/page/index'
import {Button}                        from '../../../shared/page/widgets/index'

import {SIDEBAR_MODEL_TOKEN}           from '../../editor.token'

import {WidgetComponent}               from '../widget.component'

type EditedComponent = WidgetComponent<Button>

/**
 * Displays the sidebar editing component for a heading.
 */
@Component({
    templateUrl: 'app/editor/page/sidebar/templates/button-sidebar.html',
})
export class ButtonSidebarComponent {

    private _component : EditedComponent;

    constructor(@Inject(SIDEBAR_MODEL_TOKEN) com : EditedComponent) {
        this._component = com;
    }

    get queryId() {
        return (this.model.queryReference && this.model.queryReference.queryId);
    }

    set queryId(value : string) {        
        this.model.setNewQueryId(value);
    }

    /**
     * @return All actionable queries, i.e. no SELECTs
     */
    get availableQueries() {
        return (this.project.queries.filter(q => !(q instanceof QuerySelect)))
    }

    /**
     * @return The project that is associated with the page of this button.
     */
    get project() {
        return (this.model.page.project);
    }

    /**
     * The model that is worked on.
     */
    get model() {
        return (this._component.model);
    }
}

export const BUTTON_SIDEBAR_IDENTIFIER = "page-button";

export const BUTTON_REGISTRATION = {
    typeId : BUTTON_SIDEBAR_IDENTIFIER,
    componentType : ButtonSidebarComponent
}

