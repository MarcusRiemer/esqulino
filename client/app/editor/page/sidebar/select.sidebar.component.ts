import {Component, Inject, Optional}   from '@angular/core'

import {QuerySelect}                   from '../../../shared/query'
import {Select}                        from '../../../shared/page/widgets/index'

import {SIDEBAR_MODEL_TOKEN}           from '../../editor.token'

import {WidgetComponent}               from '../widget.component'

type Component = WidgetComponent<Select>

/**
 * Displays the sidebar editing component for a <select> element.
 */
@Component({
    templateUrl: 'app/editor/page/sidebar/templates/select-sidebar.html',
})
export class SelectSidebarComponent {

    private _component : Component;

    constructor(@Inject(SIDEBAR_MODEL_TOKEN) com : Component) {
        this._component = com;
    }

    get referencedQueryName() {
        return (this._component.model.queryReferenceName);
    }

    set referencedQueryName(name : string) {
        this._component.model.queryReferenceName = name;
    }

    /**
     * All queries that are actually in use on this page.
     */
    get availableQueries() {
        if (this._component.page) {
            return (this._component.page.referencedQueries.filter(q => q.isResolveable && q.query instanceof QuerySelect));
        } else {
            return ([]);
        }
    }

    
    /**
     * The model that is worked on.
     */
    get model() {
        return (this._component.model);
    }
}

export const SELECT_SIDEBAR_IDENTIFIER = "page-select";

export const SELECT_REGISTRATION = {
    typeId : SELECT_SIDEBAR_IDENTIFIER,
    componentType : SelectSidebarComponent
}
