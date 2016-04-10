import {Component, Input}            from 'angular2/core'

import {DragService}                 from './drag.service'

import {QuerySelect}                       from '../../shared/query'

/**
 * The sidebar hosts elements that can be dragged onto the currently active
 * query. Additionally it sometimes offers a "trashcan" where items can be
 * dropped if they are meant to be deleted.
 */
@Component({
    templateUrl: 'app/editor/query/templates/sidebar.html',
    selector : 'sql-sidebar'
})
export class SidebarComponent {
    /**
     * View Variable:
     * The currently edited query
     */
    @Input() query : QuerySelect;

    constructor(private _dragService : DragService) {
    }

    /**
     * Starts a drag event involving a constant
     *
     * @param evt The DOM drag event to enrich
     */
    startConstantDrag(evt : DragEvent) {
        this._dragService.startConstantDrag("sidebar", evt);
    }

    /**
     * Starts a drag event involving a column
     *
     * @param evt The DOM drag event to enrich
     * @param table The name of the table
     * @param column The name of the column
     */
    startColumnDrag(evt : DragEvent, table : string, column : string) {
        this._dragService.startColumnDrag(table, column, "sidebar", evt);
    }

    /**
     * Starts a drag event involving a compound expression
     *
     * @param evt The DOM drag event to enrich
     */
    startCompoundDrag(evt : DragEvent) {
        this._dragService.startCompoundDrag("=", "sidebar", evt);
    }

    /**
     * Starts a drag event involving a parameter expression
     *
     * @param evt The DOM drag event to enrich
     */
    startParameterDrag(evt : DragEvent) {
        this._dragService.startParameterDrag("sidebar", evt);
    }

    /**
     * Starts a drag event involving a table.
     *
     * @param evt The DOM drag event to enrich
     */
    startTableDrag(evt : DragEvent) {
        this._dragService.startTableDrag("sidebar", evt);
    }

    /**
     * Something has been dropped on the delete indicator
     */
    onDeleteDrop(evt : DragEvent) {
        // Indicates we can drop here
        evt.preventDefault();

        this._dragService.activeSource.removeSelf();
    }

    /**
     * Something hovers over the delete indicator
     */
    onDeleteDrag(evt : DragEvent) {
        // Making sure Firefox does not start some kind of navigation
        evt.preventDefault();
    }
    
    /**
     * @return True, if the trashcan should be shown.
     */
    get hideTrash() : boolean {
        const source = this._dragService.activeSource;
        return (!source);
    }
}
