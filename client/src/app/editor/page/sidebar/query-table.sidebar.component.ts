import {Component, Inject, Optional}   from '@angular/core'

import {Query}                         from '../../../shared/query'
import {Page, QueryReference}          from '../../../shared/page/index'
import {QueryTable}                    from '../../../shared/page/widgets/index'

import {ProjectService, Project}       from '../../project.service'
import {SIDEBAR_MODEL_TOKEN}           from '../../editor.token'

import {WidgetComponent}               from '../widget.component'

type EditedComponent = WidgetComponent<QueryTable>

/**
 * The sidebar-editor for a QueryTable. This is currently in a quite
 * convoluted state due to too many ad-hoc datastructures.
 */
@Component({
    templateUrl: 'templates/query-table-sidebar.html',
})
export class QueryTableSidebarComponent {

    private _component : EditedComponent;
    
    constructor(@Inject(SIDEBAR_MODEL_TOKEN) com : EditedComponent) {
        this._component = com;
        
        if (!this._component.page) {
            throw new Error(`QueryTableSidebarComponent has no access to page`);
        }
    }

    get referencedQueryName() {
        return (this._component.model.queryReferenceName);
    }

    set referencedQueryName(name : string) {
        this._component.model.queryReferenceName = name;
    }

    get model() {
        return (this._component.model);
    }

    /**
     * @return The names of the columns that are currently available to render.
     */
    get availableColumns() {
        return (this.model.availableColumns);
    }

    /**
     * All queries that are actually in use on this page.
     */
    get availableQueries() {
        if (this._component.page) {
            return (this._component.page.referencedQueries.filter(q => q.isResolveable && q.query.select));
        } else {
            return ([]);
        }
    }
}

export const QUERY_TABLE_SIDEBAR_IDENTIFIER = "page-query-table";

export const QUERY_TABLE_REGISTRATION = {
    typeId : QUERY_TABLE_SIDEBAR_IDENTIFIER,
    componentType : QueryTableSidebarComponent
}

