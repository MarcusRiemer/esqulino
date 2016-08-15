import {
    Component, Input, OnInit, ChangeDetectorRef
} from '@angular/core'

import {Page, QueryReference}            from '../../../shared/page/index'
import {Row, RowDescription, WidgetBase} from '../../../shared/page/widgets/index'

import {SidebarService}                  from '../../sidebar.service'

import {DragService, PageDragEvent}      from '../drag.service'

/**
 * Editing the layout of esqulino pages
 */
@Component({
    selector: 'esqulino-page-layout',
    templateUrl: 'app/editor/page/wysiwyg/templates/page-layout.html',
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
     * Used during row reordering operations. Keeps track of the row to
     * hide and adds a possibility to show a drop shadow.
     */
    @Input() draggedRow : {
        row : Row
        index : number
    }
    
    /**
     * Used during widget reordering operations. Keeps track of the widget to
     * hide and adds a possibility to show a drop shadow.
     */
    @Input() draggedWidget : {
        rowIndex : number
        columnIndex : number
        widgetIndex : number
        widget : WidgetBase
    }
    
    constructor(
        private _sidebarService : SidebarService,
        private _dragService : DragService,
        private _cdRef : ChangeDetectorRef
    ) {}

    /**
     * Occurs after databinding and catches some common errors.
     */
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
                this._dragService.currentDrag.callbacks.onWidget) {
                const droppedOn = this.page.getRow(dropIndex);
                this._dragService.currentDrag.callbacks.onWidget(droppedOn);
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
    onBlueprintColumnDrag(evt : DragEvent, rowDropIndex : number, columnDropIndex : number, widgetDropIndex : number) {
        // Is the thing that could be possibly dropped a column?
        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));
        if (pageEvt.widget) {
            // Indicates we can drop here
            evt.preventDefault();
            evt.stopPropagation();
        }
    }

    /**
     * Something has been dropped onto a column.
     *
     * @param dropIndex The drop index, 0 is above the first row
     */
    onBlueprintColumnDrop(evt : DragEvent, rowDropIndex : number, columnDropIndex : number, widgetDropIndex : number) {
        // Is the thing that could be possibly dropped on a column?
        const pageEvt = <PageDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));
        if (pageEvt.widget) {
            // Indicates we can drop here
            evt.preventDefault();
            evt.stopPropagation();

            const rowIndex = rowDropIndex - 1;
            const columnIndex = columnDropIndex - 1;
            const widgetIndex = widgetDropIndex - 1;

            // Is this a drop on different place than the one that has started the drag?
            if (pageEvt.origin == "sidebar" ||
                this.draggedWidget.rowIndex != rowIndex ||
                this.draggedWidget.columnIndex != columnIndex ||
                this.draggedWidget.widgetIndex != widgetIndex) {
                // Actually place the widget
                this.page.addWidgetDeep(pageEvt.widget, rowIndex, columnIndex, widgetDropIndex);

                // Possibly inform callbacks about the drop
                if (this._dragService.currentDrag.callbacks &&
                    this._dragService.currentDrag.callbacks.onWidget) {
                    const droppedOn = this.page.getRow(rowIndex).children[columnIndex];
                    this._dragService.currentDrag.callbacks.onWidget(droppedOn);
                }
            }
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
        const desc = draggedRow.toModel() as RowDescription;
        this._dragService.startWidgetDrag(evt, "page", desc, {
            onRemove : () => this.page.removeRow(draggedRow),
            onWidget : (_) => this.page.removeRow(draggedRow),
            onDragEnd : () => this.draggedRow = undefined
        });
    }

    /**
     * Starts a drag action for a widget that is placed in the layout.
     */
    startWidgetDrag(evt : DragEvent, draggedWidget : WidgetBase,
                    rowIndex : number, columnIndex : number, widgetIndex : number) {
        this.draggedWidget = {
            rowIndex : rowIndex,
            columnIndex : columnIndex,
            widgetIndex : widgetIndex,
            widget : draggedWidget
        }
        
        
        // Make sure to remove this row on any valid drop
        this._dragService.startWidgetDrag(evt, "page", draggedWidget.toModel(), {
            onRemove : () => this.page.removeWidgetByIndex(rowIndex, columnIndex, widgetIndex),
            onWidget : () => this.page.removeWidget(draggedWidget, true),
            onDragEnd : () => this.draggedWidget = undefined
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

    /**
     * @rowIndex The index of the row according to the current page state
     * @columnIndex The index of the column according to the current page state
     * @widgetIndex The index of the widget according to the current page state
     *
     * @return True, if the widget should be shown
     */
    showWidget(rowIndex : number, columnIndex : number, widgetIndex : number) {
        return (!this.draggedWidget ||
                (this.draggedWidget.rowIndex != rowIndex ||
                 this.draggedWidget.columnIndex != columnIndex ||
                 this.draggedWidget.widgetIndex != widgetIndex));
    }
}
