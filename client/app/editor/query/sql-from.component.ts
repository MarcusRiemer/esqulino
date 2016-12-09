import {Component, Input}               from '@angular/core'

import {QueryFrom, SyntaxTree}          from '../../shared/query'

import {DragService, SqlDragEvent}      from './drag.service'

@Component({
    selector : 'sql-from',
    templateUrl : 'app/editor/query/templates/query-from.html',
})
export class FromComponent {
    @Input() query : QueryFrom;

    constructor(public dragService : DragService) {

    }

    /**
     * The user has decided to drag the first table.
     *
     * @param join The exact JOIN the user started to drag.
     */
    onJoinDragStart(join : SyntaxTree.Join, evt : DragEvent) {
        // Ensure the last element is not removed
        if (this.query.from.numberOfJoins > 0) {
            this.dragService.startTableDrag(join.toModel(), "from", evt, join);
        }
    }

    /**
     * Fired when something is being dragged over this target.
     */
    onAllowedDrag(evt : DragEvent) {
        // Indicates we can drop here
        evt.preventDefault();
    }

    /**
     * Fired when something is dropped onto a blueprint marker
     */
    onBlueprintJoinDrop(evt : DragEvent) {
        // Make sure that no redirection to the data associated with
        // the drop target occurs
        evt.preventDefault();

        // Grab the actual sql drag event
        const sqlEvt = <SqlDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));
        this.query.from.addJoin(sqlEvt.join);
    }

    /**
     * Fired when something is dropped onto this target.
     */
    onTableDrop(evt : DragEvent, dropIndex : number) {
        // Make sure that no redirection to the data associated with
        // the drop target occurs
        evt.preventDefault();

        // Grab the actual sql drag event
        const join = this.dragService.activeSource as SyntaxTree.Join;
        this.query.from.moveJoin(join, dropIndex);
    }

    /**
     * Read Only View Accessor
     * @return True, if a drop target for a new join should be shown.
     */
    get showBlueprintJoinDropTarget() {
        return (this.dragService.activeTable);
    }
}
