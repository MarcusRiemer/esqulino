import {Component, Input, OnInit}       from '@angular/core'

import {Page, ReferencedQuery}          from '../../shared/page/index'
import {Row}                            from '../../shared/page/widgets/index'

import {SidebarService}                 from '../sidebar.service'

import {DragService, PageDragEvent}     from './drag.service'
import {WidgetLoaderComponent}          from './widget-loader.component'

/**
 * Editing the layout of esqulino pages
 */
@Component({
    selector: 'esqulino-page-layout',
    templateUrl: 'app/editor/page/templates/page-layout.html',
    directives: [WidgetLoaderComponent]
})
export class PageLayoutComponent implements OnInit {
    @Input() page : Page;

    /**
     * If a drag operation is currently taking place, this
     * variable represents the index of the row that the
     * cursor was dragged over the last time.
     */
    private _hoveredDropIndex : number;

    /**
     * Rows may be hidden during reordering operations.
     */
    @Input() draggedRow : {
        row : Row
        index : number
    }
    
    constructor(
        private _sidebarService : SidebarService,
        private _dragService : DragService
    ) {}

    ngOnInit() {
        if (!this.page) {
            throw new Error("PageLayoutComponent doesn't have a page");
        }
    }
    
    /**
     * A blueprint is hovering over some row.
     *
     * @param dropIndex The drop index, 0 is above the first row
     */
    onBlueprintRowDrag(evt : DragEvent, dropIndex : number) {
        // Is the thing that could be possibly dropped on a row?
        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));
        if (pageEvt.row) {
            // Indicates we can drop here
            evt.preventDefault();
            this._hoveredDropIndex = dropIndex;
        }
    }

    /**
     * Something has been dropped onto a blueprint row.
     *
     * @param dropIndex The drop index, 0 is above the first row
     */
    onBlueprintRowDrop(evt : DragEvent, dropIndex : number) {
        // Always technically accept the drop event, but not necesarily
        // do anything.
        evt.preventDefault();

        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));
        if (pageEvt.row) {           
            // Add the new row
            this.page.addRow(dropIndex, pageEvt.row);

            // Possibly inform callbacks about the drop
            if (this._dragService.currentDrag.callbacks &&
                this._dragService.currentDrag.callbacks.onRow) {
                const droppedRow = this.page.rows[dropIndex];
                this._dragService.currentDrag.callbacks.onRow(droppedRow);
            }

            // And reset all hovering state
            this._hoveredDropIndex = undefined;
        }
    }

    /**
     * Something has been dropped onto a column.
     *
     * @param dropIndex The drop index, 0 is above the first row
     */
    onBlueprintColumnDrag(evt : DragEvent, rowDropIndex : number, columnDropIndex : number) {
        // Is the thing that could be possibly dropped a row?
        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));
        if (pageEvt.widget) {
            // Indicates we can drop here
            evt.preventDefault();
        }
    }

    /**
     * Something has been dropped onto a column.
     *
     * @param dropIndex The drop index, 0 is above the first row
     */
    onBlueprintColumnDrop(evt : DragEvent, rowDropIndex : number, columnDropIndex : number) {
        // Is the thing that could be possibly dropped on a column?
        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));
        if (pageEvt.widget) {
            // Indicates we can drop here
            evt.preventDefault();
            evt.stopPropagation();

            // Actually place the widget
            this.page.addWidget(pageEvt.widget, rowDropIndex - 1, columnDropIndex - 1, 0);
        }
    }

    /**
     * Starts a drag action for a row that is placed in the layout.
     */
    startRowDrag(evt : DragEvent, draggedRow : Row, rowIndex : number) {
        this.draggedRow = {
            index : rowIndex,
            row : draggedRow
        };
        
        // Make sure to remove this row on any valid drop
        this._dragService.startRowDrag(evt, "page", draggedRow.toModel(), {
            onRemove : () => this.page.removeRow(draggedRow),
            onRow : (_) => this.page.removeRow(draggedRow),
            onDragEnd : () => this.draggedRow = undefined
        });
    }

    /**
     * @param dropIndex The drop index, 0 is above the first row
     *
     * @return True, if the blueprint for row the given row should be shown.
     */
    showBlueprintRow(dropIndex : number) : boolean {
        return (this._dragService.activeRow &&
                (dropIndex == this._hoveredDropIndex));
    }

    /**
     * @rowIndex The index of the row according to the current page state
     *
     * @return True, if the row should be shown
     */
    showRow(rowIndex : number) : boolean {
        return (!this.draggedRow || this.draggedRow.index != rowIndex);
    }
}
