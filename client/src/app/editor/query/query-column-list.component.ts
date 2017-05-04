import {
    Component, Input, Output, OnInit, EventEmitter,
    ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core'

import {DragService}                      from './drag.service'

import {TrashService}                     from '../shared/trash.service'

import {SyntaxTree, ResultColumn}         from '../../shared/query'

/**
 * Displays re-orderable columns of a specific query. This may be used for
 * widgets
 */
@Component({
    selector: 'query-column-list',
    templateUrl: 'templates/query-column-list.html'
})
export class QueryColumnListComponent {
    /**
     * The SELECT that ultimately provides the columns.
     */
    @Input() select : SyntaxTree.Select;

    /**
     * The initial (and resulting) column order.
     */
    @Input() columnNames : string[] = [];

    /**
     * Fired when the column names change
     */
    @Output() columnNamesChange = new EventEmitter();

    /**
     * The column that is currently being dragged.
     */
    private _currentDrag : {
        col : ResultColumn
        index : number
    } = undefined;

    /**
     *
     */
    private _currentHoverIndex : number = undefined;

    constructor(
        private _dragService : DragService,
        private _cdRef : ChangeDetectorRef,
        private _trashService : TrashService
    ) {
    }

    /**
     * The user has started a drag-operation to re-order columns.
     */
    onDragStart(evt : DragEvent, index : number, col : ResultColumn) {
        // No further dragging must take place
        evt.stopPropagation();

        // Specifying the actual drag operation
        const dragData = JSON.stringify({
            reorder : col.fullName
        });
        evt.dataTransfer.setData('text/plain', dragData);
        evt.dataTransfer.effectAllowed = 'none';

        // Remember the current drag operation
        this._currentDrag = {
            col : col,
            index : index
        };
        this._currentHoverIndex = index;
        this._cdRef.detach();

        // React to trashing
        this._trashService.showTrash((data) => {
            this.columnNames.splice(index, 1);
            this.columnNamesChange.emit(this.columnNames);
        });

        // And make sure it is forgotten once the drag has ended.
        evt.target.addEventListener("dragend", () => {
            console.log(`Stop: Reordering column: ${dragData}`);
            this._currentDrag = undefined;
            this._currentHoverIndex = undefined;

            this._cdRef.reattach();
        });

        console.log(`Start: Reordering column: ${dragData}`);
    }

    /**
     * @return The full name may be used to uniquely identify a column.
     */
    trackByName(i : number, col : ResultColumn) {
        return (col.fullName);
    }

    allowDrag(evt : DragEvent) {
        evt.preventDefault();
    }

    /**
     * Used to update the hovering index.
     */
    onColumnDragOver(evt : DragEvent, index : number) {
        /*this._currentHoverIndex = index;
        evt.preventDefault();*/

        // TODO: The code below shows how it should be done, but
        //       it seems that angular keeps recreating the DOM
        //       which happens faster then the code below can keep
        //       up with setting data and firing preventDefault().
        //
        //       If that is the case, it's a hell of a
        //       race condition ...

        const dragData = JSON.parse(evt.dataTransfer.getData('text/plain'));
        if (dragData.reorder || dragData.columnRef) {
            evt.preventDefault();

            const oldIndex = this._currentHoverIndex;

            if (oldIndex != index) {

                //this._cdRef.detectChanges();
                this._currentHoverIndex = index;

                console.log(`${oldIndex} -> ${index}`);

            }
        } else {
            console.log(`Invalid Drag: Reordering column: ${dragData}`);
        }
    }

    /**
     * Something was dropped on a column.
     */
    onColumnDrop(evt : DragEvent, newIndex : number) {
        const dragData = JSON.parse(evt.dataTransfer.getData('text/plain'));

        console.log(`Drop: Reordering column: ${dragData}`);

        if (dragData.reorder || dragData.columnRef) {

            // Prevent that the browser triggers any kind of navigation
            evt.preventDefault();

            if (dragData.reorder) {
                // Move the item in the names array
                // http://stackoverflow.com/questions/5306680/#5306832
                const oldIndex = this._currentDrag.index;
                console.log(`Reorder Drop: ${oldIndex} -> ${newIndex}`);

                if (oldIndex < newIndex) {
                    newIndex -= 1;
                }

                this.columnNames.splice(newIndex + 1, 0, this.columnNames.splice(oldIndex, 1)[0]);
            }
            else if (dragData.columnRef) {
                console.log(`Column Ref Drop: ${JSON.stringify(dragData.columnRef)}`);
                const columnName = dragData.columnRef.columnName;
                const queryName = dragData.columnRef.queryName;

                // Ensure the queries match
                if (queryName === this.query.name) {
                    // Remove any column that would introduce a duplicate
                    this.columnNames = this.columnNames.filter(c => c != columnName);

                    // And insert the new column
                    this.columnNames.splice(newIndex + 1, 0, columnName);
                }
            }

            // Tell the view about the change
            this.columnNamesChange.emit(this.columnNames);
            this._cdRef.detectChanges();
        } else {
            throw new Error(`Invalid Drop: Reordering column: ${dragData}`);
        }
    }

    getColumnIndex(index : number, col : ResultColumn) : number {
        if (this._currentDrag === undefined || this._currentHoverIndex === undefined) {
            // NOP if no dragging happens
            return (index);
        } else if (col.fullName === this._currentDrag.col.fullName) {
            // The current hover index if this ist the element that is curently
            // being dragged.
            return (this._currentHoverIndex);
        } else if (index >= this._currentHoverIndex) {
            // Something was pulled before this element
            return (index + 1);
        } else {
            // Something is being dragged after this element, but that
            // doesn't affect this element at all.
            return (index);
        }
    }

    /**
     * @return True, if the column at the given index should be shown.
     */
    showColumn(index : number) : boolean {
        return (!this._currentDrag || this._currentDrag.index != index);
    }

    /**
     * @return True, if the column at the given index should be shown.
     */
    insertionColumn(index : number) : ResultColumn {
        if (this._currentDrag && this._currentHoverIndex == index) {
            return (this._currentDrag.col);
        } else {
            return (undefined);
        }
    }

    /**
     * @return The actual columns that should be displayed.
     */
    get columns() : ResultColumn[] {
        return (this.columnNames.map(c => this.select.getActualColumnByName(c)));
    }

    /**
     * The query the column list is part of.
     */
    get query() {
        return (this.select.query);
    }

    /**
     * @return True, if a "append new column here" marker should appear.
     */
    @Input()
    get showBlueprintDropTarget() : boolean {
        return (this._currentDrag != undefined);
    }
}
