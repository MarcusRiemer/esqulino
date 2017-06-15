import {Component, Inject, Optional}   from '@angular/core'

import {Query}                         from '../../../shared/query'
import {QueryReference}                from '../../../shared/page/index'
import {Button}                        from '../../../shared/page/widgets/index'

import {SIDEBAR_MODEL_TOKEN}           from '../../editor.token'

import {WidgetComponent}               from '../widget.component'

/**
 * Displays the sidebar editing component for a heading.
 */
@Component({
    templateUrl: 'templates/button-sidebar.html',
})
export class ButtonSidebarComponent {
    // This should be const, but it can't be in Typescript 2
    public SAME_PAGE_ID = "current";

    // This should be const, but it can't be in Typescript 2
    public NO_ACTION_ID = "no-action";
    
    private _component : WidgetComponent<Button>;

    constructor(@Inject(SIDEBAR_MODEL_TOKEN) com : WidgetComponent<Button>) {
        this._component = com;
    }

    /**
     * @return The id of the currently targeted action, or NO_ACTION_ID
     *         if no action is targeted.
     */
    get queryId() {
        if (this.model.queryReference.isSet) {
            return (this.model.queryReference.queryId);
        } else {
            return (this.NO_ACTION_ID);
        }
    }

    set queryId(value : string) {
        if (this.NO_ACTION_ID != value) {
            this.model.setNewQueryId(value);
        } else {
            this.model.queryReference.clear();
        }
    }

    /**
     * @return The id of the currently targeted Page, or SAME_PAGE_ID
     *         if no page is targeted.
     */
    get targetPageId() {
        if (this.model.navigateAction.isInternal) {
            return (this.model.navigateAction.internalPageId);
        } else {
            return (this.SAME_PAGE_ID);
        }
    }
    
    /**
     * @param value The id of the targeted Page, or SAME_PAGE_ID
     *              if no page should be targeted.
     */
    set targetPageId(id : string) {
        if (id === this.SAME_PAGE_ID) {
            this.model.navigateAction.clear();
        } else {
            this.model.navigateAction.internalPageId = id;
        }
    }

    get availablePages() {
        return (this.project.pages.filter(q => q.id != this.model.page.id));
    }

    /**
     * @return All actionable queries, i.e. no SELECTs
     */
    get availableQueries() {
        return (this.project.queries.filter(q => !(q.select)))
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

