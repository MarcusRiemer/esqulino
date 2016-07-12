import {
    Component, Inject, OnInit, ChangeDetectorRef
} from '@angular/core'

import {ReferencedQuery}            from '../../../shared/page/index'
import {QuerySelect}                from '../../../shared/query'
import {QueryTable}                 from '../../../shared/page/widgets/index'

import {ProjectService, Project}    from '../../project.service'
import {SidebarService}             from '../../sidebar.service'
import {WIDGET_MODEL_TOKEN}         from '../../editor.token'

import {DragService, PageDragEvent} from '../drag.service'

import {WidgetComponent}            from './widget.component'
import {
    QUERY_TABLE_SIDEBAR_IDENTIFIER, QueryTableSidebarComponent
} from './query-table.sidebar.component'


export {QueryTable}

/**
 * Editor preview for the query table
 */
@Component({
    templateUrl: 'app/editor/page/widgets/templates/query-table.html',
    selector: "esqulino-query-table",
    inputs: []
})
export class QueryTableComponent extends WidgetComponent<QueryTable> {

    private _project : Project;
    private _query : QuerySelect;
    private _queryReference: ReferencedQuery;
    
    constructor(@Inject(WIDGET_MODEL_TOKEN) model : QueryTable,
                private _cdRef: ChangeDetectorRef,
                sidebarService : SidebarService,
                projectService : ProjectService) {
        super(sidebarService, model, {
            id : QUERY_TABLE_SIDEBAR_IDENTIFIER,
            type : QueryTableSidebarComponent
        });

        // Grab the correct query from the loaded project
        projectService.activeProject.subscribe(proj => {
            this._project = proj;
            this.refreshQuery();
        })
    }

    /**
     * @return The currently edited query
     */
    get query() : QuerySelect {
        return (this._query);
    }

    setQuery(queryId : string) {
        this.model.queryId = queryId;
        this.refreshQuery();
    }

    onDragOver(evt : DragEvent) {
        // Is the thing that could be possibly dropped a QueryReference?
        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));
        if (pageEvt.queryRef) {
            // Indicates we can drop here
            evt.preventDefault();
            evt.stopPropagation();
        }
    }

    onDrop(evt : DragEvent) {
        // Is the thing that could be possibly dropped a QueryReference?
        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));
        if (pageEvt.queryRef) {
            // Indicates we can drop here
            evt.preventDefault();
            evt.stopPropagation();

            this.setQuery(pageEvt.queryRef.queryId);
        }
    }

    refreshQuery() {
        const query = this._project.getQueryById(this.model.queryId);
        if (query instanceof QuerySelect) {
            this._query = query;
        }

        this._cdRef.markForCheck();
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
