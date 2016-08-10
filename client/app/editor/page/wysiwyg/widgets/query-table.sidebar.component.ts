import {Component, Inject, Optional}   from '@angular/core'

import {QuerySelect}                   from '../../../../shared/query'
import {Page, QueryReference}          from '../../../../shared/page/index'
import {QueryTable}                    from '../../../../shared/page/widgets/index'

import {ProjectService, Project}       from '../../../project.service'
import {SIDEBAR_MODEL_TOKEN}           from '../../../editor.token'
import {SidebarItemHost}               from '../../../sidebar-item-host.component'

import {QueryTableComponent}           from './query-table.component'

/**
 * The sidebar-editor for a QueryTable. This is currently in a quite
 * convoluted state due to too many ad-hoc datastructures.
 */
@Component({
    templateUrl: 'app/editor/page/wysiwyg/widgets/templates/query-table-sidebar.html',
    directives : [SidebarItemHost]
})
export class QueryTableSidebarComponent {

    private _component : QueryTableComponent;
    
    constructor(@Inject(SIDEBAR_MODEL_TOKEN) com : QueryTableComponent) {
        this._component = com;
        
        if (!this._component.page) {
            throw new Error(`QueryTableSidebarComponent has no access to page`);
        }
    }

    get referencedQueryName() {
        return (this._component.referenceName);
    }

    set referencedQueryName(name : string) {
        this._component.referenceName = name;
    }

    get model() {
        return (this._component.model);
    }

    /**
     * @return The names of the columns that are currently available to render.
     */
    get availableColumns() {
        if (this._component.queryReference &&
            this._component.queryReference.isResolveable &&
            this._component.queryReference.query instanceof QuerySelect) {

            const query = this._component.queryReference.query as QuerySelect;
            const columns = query.select.actualColums
            return (columns);
            
        } else {
            return ([]);
        }
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
}

export const QUERY_TABLE_SIDEBAR_IDENTIFIER = "page-query-table";

