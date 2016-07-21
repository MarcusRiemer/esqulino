import {Component, Inject, Optional}        from '@angular/core'

import {QuerySelect}                        from '../../../shared/query'
import {Page, ReferencedQuery}              from '../../../shared/page/index'
import {QueryTable}                         from '../../../shared/page/widgets/index'

import {
    ProjectService, Project, AvailableQuery
} from '../../project.service'
import {
    SIDEBAR_MODEL_TOKEN
} from '../../editor.token'

import {QueryTableComponent}                from './query-table.component'

/**
 * The sidebar-editor for a QueryTable. This is currently in a quite
 * convoluted state due to too many ad-hoc datastructures.
 */
@Component({
    templateUrl: 'app/editor/page/widgets/templates/query-table-sidebar.html',
})
export class QueryTableSidebarComponent {

    private _component : QueryTableComponent;

    private _project : Project;
    
    constructor(@Inject(SIDEBAR_MODEL_TOKEN) com : QueryTableComponent,
                projectService : ProjectService) {
        this._component = com;
        
        if (!this._component.page) {
            throw new Error(`QueryTableSidebarComponent has no access to page`);
        }

        projectService.activeProject.subscribe(project => {
            this._project = project;
        });
    }

    /**
     * As the DOM only saves & compares string values, we need a unique
     * and reversible string-representation of a referenced query.
     */
    buildReferenceString(value : AvailableQuery) : string {
        return (JSON.stringify({
            name : value.ref.name,
            queryId : value.query.id
        }));
    }

    /**
     * @return A JSON representation of the query reference
     */
    get referencedString() : string {
        return (JSON.stringify(this.referencedQuery));
    }

    /**
     * @param newValue A JSON representation of the query reference
     */
    set referencedString(newValue : string) {
        this.referencedQuery = JSON.parse(newValue);
    }

    get referencedQuery() {
        return (this.model.queryReference);
    }

    set referencedQuery(newId : ReferencedQuery) {
        this._component.setQuery(newId);
    }

    get model() {
        return (this._component.model);
    }

    /**
     * All queries that are actually in use on this page.
     */
    get availableQueries() : AvailableQuery[] {
        if (this._project) {
            return (this._project.getAvailableQueries(this._component.page));
        } else {
            return ([]);
        }
    }
}

export const QUERY_TABLE_SIDEBAR_IDENTIFIER = "page-query-table";

