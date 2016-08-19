import {
    Component, Inject, OnInit, ChangeDetectorRef
} from '@angular/core'

import {Page, QueryReference}       from '../../../../shared/page/index'
import {QuerySelect, ResultColumn}  from '../../../../shared/query'
import {QueryTable}                 from '../../../../shared/page/widgets/index'

import {ProjectService, Project}    from '../../../project.service'
import {SidebarService}             from '../../../sidebar.service'
import {RegistrationService}        from '../../../registration.service'
import {
    WIDGET_MODEL_TOKEN
} from '../../../editor.token'

import {DragService, PageDragEvent} from '../../drag.service'
import {WidgetComponent}            from '../../widget.component'

export {QueryTable}

/**
 * Editor preview for the query table
 */
@Component({
    templateUrl: 'app/editor/page/wysiwyg/widgets/templates/query-table.html',
    selector: "esqulino-query-table",
})
export class QueryTableComponent extends WidgetComponent<QueryTable> {
    
    constructor(@Inject(WIDGET_MODEL_TOKEN) model : QueryTable,
                private _cdRef: ChangeDetectorRef,
                private _dragService : DragService,
                registrationService : RegistrationService,
                sidebarService : SidebarService) {
        super(sidebarService, model);
    }

    /**
     * @return The page this widget belongs to
     */
    get page() : Page {
        return (this.model.page);
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
        if (this.model.hasValidReference) {
            this.model.useAllColumns();
            this._cdRef.markForCheck();
        }
    }

    trackByColumn(index : number, column : ResultColumn) {
        return (column.fullName);
    }
}
