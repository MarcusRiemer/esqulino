import {Component, Inject, OnInit} from '@angular/core'

import {QuerySelect}               from '../../../shared/query'
import {QueryTable}                from '../../../shared/page/widgets/index'

import {ProjectService}            from '../../project.service'
import {SidebarService}            from '../../sidebar.service'
import {SIDEBAR_MODEL_TOKEN}       from '../../sidebar.token'

import {WidgetComponent}           from './widget.component'

export {QueryTable}

@Component({
    templateUrl: 'app/editor/page/widgets/templates/query-table.html',
    selector: "esqulino-query-table"
})
export class QueryTableComponent extends WidgetComponent<QueryTable> {

    private _query : QuerySelect;
    
    constructor(@Inject(SIDEBAR_MODEL_TOKEN) model : QueryTable,
                sidebarService : SidebarService,
                projectService : ProjectService) {
        super(sidebarService, model);

        projectService.activeProject.subscribe(proj => {
            const query = proj.getQueryById(this.model.queryId);
            if (query instanceof QuerySelect) {
                this._query = query;
                const queryName = query.name;
                
                console.log(queryName);
            }
        })
    }

    get query() : QuerySelect {
        return (this._query);
    }

    get Columns() {
        if (this._query) {
            return (this._query.select.actualColums);
        } else {
            return [];
        }
    }
}
