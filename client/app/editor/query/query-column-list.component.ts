import {
    Component, Input, Output, OnInit, EventEmitter
} from '@angular/core'

import {DragService}                      from './drag.service'

import {SyntaxTree, ResultColumn}         from '../../shared/query'

/**
 * Displays re-orderable columns of a specific query. This may be used for
 * widgets
 */
@Component({
    selector: 'query-column-list',
    templateUrl: 'app/editor/query/templates/query-column-list.html'
})
export class QueryColumnListComponent implements OnInit {
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
        private _dragService : DragService
    ) {
    }

    ngOnInit() {

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

        // And make sure it is forgotten once the drag has ended.
        evt.target.addEventListener("dragend", () => {
            console.log(`Stop: Reordering column: ${dragData}`);
            this._currentDrag = undefined;
            this._currentHoverIndex = undefined;
        });

        console.log(`Start: Reordering column: ${dragData}`);
    }

    /**
     * @return The full name may be used to uniquely identify a column.
     */
    trackByName(i : number, col : ResultColumn) {
        return (col.fullName);
    }

    /**
     * Used to update the hovering index.
     */
    onColumnDragOver(evt : DragEvent, index : number) {
        evt.preventDefault();
        this._currentHoverIndex = index;
    }

    onColumnDrop(evt : DragEvent, new_index : number) {
        // Prevent that the browser triggers any kind of navigation
        evt.preventDefault();
        
        // Move the item in the names array
        // http://stackoverflow.com/questions/5306680/#5306832
        const old_index = this._currentDrag.index;
        this.columnNames.splice(new_index + 1, 0, this.columnNames.splice(old_index, 1)[0]);

        this.columnNamesChange.emit(this.columnNames);
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
