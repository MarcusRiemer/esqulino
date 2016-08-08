import {
    Component, Inject, OnInit, ChangeDetectorRef
} from '@angular/core'

import {Page, QueryReference}       from '../../../../shared/page/index'
import {QuerySelect, ResultColumn}  from '../../../../shared/query'
import {QueryTable}                 from '../../../../shared/page/widgets/index'

import {QueryIconComponent}         from '../../../query-icon.component'
import {ProjectService, Project}    from '../../../project.service'
import {SidebarService}             from '../../../sidebar.service'
import {
    WIDGET_MODEL_TOKEN
} from '../../../editor.token'

import {DragService, PageDragEvent} from '../../drag.service'

import {WidgetComponent}            from './widget.component'
import {
    QUERY_TABLE_SIDEBAR_IDENTIFIER, QueryTableSidebarComponent
} from './query-table.sidebar.component'


export {QueryTable}

/**
 * Editor preview for the query table
 */
@Component({
    templateUrl: 'app/editor/page/wysiwyg/widgets/templates/query-table.html',
    selector: "esqulino-query-table",
    directives : [QueryIconComponent]
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

    /**
     * @return The name of the reference this query table will receive
     *         it's data from.
     */
    get referenceName() {
        return (this.model.queryReferenceName);
    }

    /**
     * @param value Update the reference name that this query table will
     *              receive it's data from.
     */
    set referenceName(value : string) {
        this.model.queryReferenceName = value;
        this.useAllColumns()
        this._cdRef.markForCheck();
    }

    /**
     * @return True, if this reference can be resolved on the current page.
     */
    get hasValidReference() {
        return (this._page.usesQueryReferenceByName(this.referenceName) &&
                this.queryReference.isResolveable &&
                this.queryReference.query instanceof QuerySelect);
    }

    /**
     * @return True, if this query table references any columns
     */
    get hasColumnReferences() {
        return (this.model.columnNames.length > 0);
    }

    /**
     * @return A (hopefully) resolveable reference to a query.
     */
    get queryReference() {
        return (this._page.getQueryReferenceByName(this.referenceName));
    }

    /**
     * Something has been dragged over the query name
     */
    onDragOver(evt : DragEvent, colIndex? : number) {
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
    onDrop(evt : DragEvent, colIndex? : number) {
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

            this.addColumn(pageEvt.columnRef.columnName, colIndex);
        }
    }

    /**
     * Start dragging a column reference.
     */
    startColumnRefDrag(evt: DragEvent, column : ResultColumn) {
        this._dragService.startColumnRefDrag(evt, "page", {
            columnName : column.shortName,
            queryName : this.referenceName
        }, {
            onRemove: () => this.removeColumn(column.shortName)
        });

        evt.stopPropagation();
    }

    /**
     * Adds a new column to the model of this query table.
     */
    addColumn(name : string, colIndex? : number) {
        if (colIndex >= 0) {
            this.model.columnNames.splice(colIndex + 1, 0, name);
        } else {
            this.model.columnNames.push(name);
        }

        this._cdRef.markForCheck();
    }

    /**
     * Removes the given name from the query table
     * 
     * @param fullName The full name of the column that should be removed.
     */
    removeColumn(fullName : string) {
        this.model.columnNames = this.model.columnNames.filter(v => v != fullName);

        this._cdRef.markForCheck();
    }

    /**
     * Updates the model to use all columns that are available.
     */
    useAllColumns() {
        if (this.hasValidReference) {
            // Compute all possible columns
            const ref = this._page.getQueryReferenceByName(this.referenceName);
            const query = ref.query as QuerySelect;
            const possibleColumns = query.select.actualColums;

            this.model.columnNames = possibleColumns.map(c => c.shortName);

            this._cdRef.markForCheck();
        }
    }

    /**
     * Return used columns if they are currently known.
     */
    get columns() {
        if (this.referenceName) {            
            // 1) Get the reference itself
            const ref = this._page.getQueryReferenceByName(this.referenceName);
            // 2) Resolve the reference to the actual query
            const query = ref.query as QuerySelect;
            const possibleColumns = query.select.actualColums;
            // 3) Pick the columns that are wished by the user
            const columns = this.model.columnNames
                .map(name => possibleColumns.find(col => col.shortName == name))
                .filter(c => !!c)
            
            return (columns);
        } else {
            return [];
        }
    }

    trackByColumn(index : number, column : ResultColumn) {
        return (column.fullName);
    }
}
