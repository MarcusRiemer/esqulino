import {Component, Inject, OnInit} from '@angular/core'

import {QuerySelect}               from '../../../shared/query'
import {QueryTable}                from '../../../shared/page/widgets/index'

import {ProjectService}            from '../../project.service'
import {SidebarService}            from '../../sidebar.service'
import {SIDEBAR_MODEL_TOKEN}       from '../../sidebar.token'

import {WidgetComponent}           from './widget.component'
import {
    QUERY_TABLE_SIDEBAR_IDENTIFIER, QueryTableSidebarComponent
} from './query-table.sidebar.component'


export {QueryTable}

@Component({
    templateUrl: 'app/editor/page/widgets/templates/query-table.html',
    selector: "esqulino-query-table",
    inputs: []
})
export class QueryTableComponent extends WidgetComponent<QueryTable> {

    private _query : QuerySelect;
    
    constructor(@Inject(SIDEBAR_MODEL_TOKEN) model : QueryTable,
                sidebarService : SidebarService,
                projectService : ProjectService) {
        super(sidebarService, model, {
            id : QUERY_TABLE_SIDEBAR_IDENTIFIER,
            type : QueryTableSidebarComponent
        });

        // Grab the correct query from the loaded project
        projectService.activeProject.subscribe(proj => {
            const query = proj.getQueryById(this.model.queryId);
            if (query instanceof QuerySelect) {
                this._query = query;
            }
        })
    }

    get query() : QuerySelect {
        return (this._query);
    }

    /**
     *
     */
    get columns() {
        if (this._query) {
            return (this._query.select.actualColums);
        } else {
            return [];
        }
    }
}
