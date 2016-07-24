import {
    Component, Inject, OnInit, ChangeDetectorRef
} from '@angular/core'

import {Page, QueryReference}       from '../../../shared/page/index'
import {QuerySelect, ResultColumn}  from '../../../shared/query'
import {QueryTable}                 from '../../../shared/page/widgets/index'

import {ProjectService, Project}    from '../../project.service'
import {SidebarService}             from '../../sidebar.service'
import {
    WIDGET_MODEL_TOKEN
} from '../../editor.token'

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
    selector: "esqulino-query-table"
})
export class QueryTableComponent extends WidgetComponent<QueryTable> {
    
    constructor(@Inject(WIDGET_MODEL_TOKEN) model : QueryTable,
                private _page : Page,
                private _cdRef: ChangeDetectorRef,
                private _dragService : DragService,
                sidebarService : SidebarService) {
        super(sidebarService, model, {
            id : QUERY_TABLE_SIDEBAR_IDENTIFIER,
            type : QueryTableSidebarComponent
        });
    }

    /**
     * @return The page this widget belongs to
     */
    get page() : Page {
        return (this._page);
    }

    get referenceName() {
        return (this.model.queryReferenceName);
    }
    
    set referenceName(value : string) {
        this.model.queryReferenceName = value;
        this._cdRef.markForCheck();
    }

    get queryReference() {
        return (this._page.getQueryReferenceByName(this.referenceName));
    }

    /**
     * Something has been dragged over the query name
     */
    onQueryDragOver(evt : DragEvent) {
        // Is the thing that could be possibly dropped a QueryReference?
        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));
        if (pageEvt.queryRef || pageEvt.columnRef) {
            // Indicates we can drop here
            evt.preventDefault();
            evt.stopPropagation();
        }
    }

    /**
     * Something has been dropped on the query name
     */
    onQueryDrop(evt : DragEvent) {
        // Is the thing that could be possibly dropped a QueryReference?
        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));
        if (pageEvt.queryRef) {
            // Indicates we can drop here
            evt.preventDefault();
            evt.stopPropagation();
            
            this.referenceName = pageEvt.queryRef.name;
        }
        else if (pageEvt.columnRef) {
            // Indicates we can drop here
            evt.preventDefault();
            evt.stopPropagation();

            this.addColumn(pageEvt.columnRef.columnName);
        }
    }

    startColumnRefDrag(evt: DragEvent, column : ResultColumn) {
        this._dragService.startColumnRefDrag(evt, "page", {
            columnName : column.fullName,
            queryName : this.referenceName
        }, {
            onRemove: () => this.removeColumn(column.fullName)
        });

        evt.stopPropagation();
    }

    addColumn(fullName : string) {
        this.model.columnNames.push(fullName);

        this._cdRef.markForCheck();
    }

    /**
     * Removes the given name from the query table
     * 
     * @param fullName The full name of the column that should be removed.
     */
    removeColumn(fullName : string) {
        if (this.model.columnNames.length == 0) {
            this.model.columnNames = this.columns.map(c => c.fullName);
        }

        this.model.columnNames = this.model.columnNames.filter(v => v != fullName);

        this._cdRef.markForCheck();
    }

    /**
     * Return used columns if they are currently known.
     */
    get columns() {
        if (this.referenceName) {            
            // 1) Get the reference itself
            const ref = this._page.getQueryReferenceByName(this.referenceName);
            // 2) Resolve the reference to the actual query to find all possible columns
            const query = ref.query as QuerySelect;
            let columns = query.select.actualColums;
            // 3) If the user has decided to narrow done the columns (or change
            //    their order) these need to be re-mapped.
            if (this.model.columnNames.length > 0) {
                columns = this.model.columnNames
                    .map(name => columns.find(col => col.fullName == name));
            }
            
            return (columns);
        } else {
            return [];
        }
    }

    trackByColumn(index : number, column : ResultColumn) {
        return (column.fullName);
    }
}
