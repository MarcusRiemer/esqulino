import {Component, Inject, Optional}        from '@angular/core'

import {Link}                               from '../../../shared/page/widgets/index'

import {SIDEBAR_MODEL_TOKEN}                from '../../editor.token'

import {LinkComponent}                      from './link.component'

@Component({
    templateUrl: 'app/editor/page/widgets/templates/link-sidebar.html',
})
export class LinkSidebarComponent {

    private _model : Link;

    private _currentPageId : string;
    
    constructor(@Inject(SIDEBAR_MODEL_TOKEN) com : LinkComponent) {
        this._model = com.model;
    }

    get model() {
        return (this._model);
    }

    /**
     * All internal pages this link could refer to.
     */
    get possiblePages() {
        return (this._model.page.project.pages);
    }

    get currentPageId() {
        return (this._model.action.internalPageId);
    }

    set currentPageId(value : string) {
        this._model.action.internalPageId = value;
    }

    get currentExternalUrl() {
        return (this._model.action.externalUrl);
    }

    set currentExternalUrl(value : string) {
        this._model.action.externalUrl = value;
    }
}

export const LINK_SIDEBAR_IDENTIFIER = "page-link";

