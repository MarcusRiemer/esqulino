import {Component, Inject, Optional}        from '@angular/core'

import {QuerySelect}                        from '../../../shared/query'
import {QueryTable}                         from '../../../shared/page/widgets/index'

import {ProjectService}                     from '../../project.service'
import {SIDEBAR_MODEL_TOKEN}                from '../../sidebar.token'

@Component({
    templateUrl: 'app/editor/page/widgets/templates/query-table-sidebar.html',
})
export class QueryTableSidebarComponent {

    private _model : QueryTable;

    private _availableQueries : QuerySelect[];
    
    constructor(@Inject(SIDEBAR_MODEL_TOKEN) model : QueryTable,
                private _projectService : ProjectService) {
        this._model = model;

        // Grabbing all SELECT queries
        this._projectService.activeProject.subscribe( (project) => {
            this._availableQueries = <QuerySelect[]>project.queries.filter(q => q instanceof QuerySelect);
        });
    }

    get model() {
        return (this._model);
    }

    get availableQueries() {
        return (this._availableQueries);
    }
}

export const QUERY_TABLE_SIDEBAR_IDENTIFIER = "page-query-table";

