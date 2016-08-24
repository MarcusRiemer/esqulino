import {Component, Input, OnInit}         from '@angular/core'

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
     * The drag operation that is currently taking place.
     */
    private _currentDrag : ResultColumn = undefined;

    constructor(
        private _dragService : DragService
    ) {
    }

    ngOnInit() {

    }

    /**
     * The user has started a drag-operation to re-order columns.
     */
    onDragStart(evt : DragEvent, col : ResultColumn) {
        // No further dragging must take place
        evt.stopPropagation();

        // Specifying the actual drag operation
        const dragData = JSON.stringify({
            reorder : col.fullName
        });
        evt.dataTransfer.setData('text/plain', dragData);
        evt.dataTransfer.effectAllowed = 'move';

        // Remember the current drag operation and make sure
        // it is erased once the drag has ended.
        this._currentDrag = col;
        evt.target.addEventListener("dragend", () => {
            console.log(`Stop: Reordering column: ${dragData}`);
            this._currentDrag = undefined;
        });

        console.log(`Start: Reordering column: ${dragData}`);
    }

    trackByName(i : number, col : ResultColumn) {
        return (col.fullName);
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
    get showBlueprintDropDarget() {
        return (!!this._currentDrag);
    }
}
