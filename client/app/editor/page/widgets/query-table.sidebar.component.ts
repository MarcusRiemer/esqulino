import {Component, Inject, Optional}        from '@angular/core'

import {QuerySelect}                        from '../../../shared/query'
import {QueryTable}                         from '../../../shared/page/widgets/index'

import {ProjectService}                     from '../../project.service'
import {SIDEBAR_MODEL_TOKEN}                from '../../editor.token'

import {QueryTableComponent}                from './query-table.component'

@Component({
    templateUrl: 'app/editor/page/widgets/templates/query-table-sidebar.html',
})
export class QueryTableSidebarComponent {

    private _component : QueryTableComponent;

    private _availableQueries : QuerySelect[];
    
    constructor(@Inject(SIDEBAR_MODEL_TOKEN) com : QueryTableComponent,
                private _projectService : ProjectService) {
        this._component = com;

        // Grabbing all SELECT queries
        this._projectService.activeProject.subscribe( (project) => {
            this._availableQueries = <QuerySelect[]>project.queries.filter(q => q instanceof QuerySelect);
        });
    }

    get referencedQueryId() {
        return (this.model.queryId);
    }

    set referencedQueryId(newId : string) {
        this._component.setQuery(newId);
        console.log("Referenced query changed");
    }

    get model() {
        return (this._component.model);
    }

    get availableQueries() {
        return (this._availableQueries);
    }
}

export const QUERY_TABLE_SIDEBAR_IDENTIFIER = "page-query-table";

