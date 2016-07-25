import {Component, Input}               from '@angular/core'

import {QueryFrom, SyntaxTree}          from '../../shared/query'

import {DragService, SqlDragEvent}      from './drag.service'
import {ExpressionComponent}            from './sql-expr.component'

@Component({
    selector : 'sql-from',
    templateUrl : 'app/editor/query/templates/query-from.html',
})
export class FromComponent {
    @Input() query : QueryFrom;

    constructor(public dragService : DragService) {

    }

    onJoinDragStart(join : SyntaxTree.Join, evt : DragEvent) {
        this.dragService.startTableDrag(join.toModel(), "from", evt, join);
    }

    /**
     * Fired when something is being dragged over this target.
     */
    onBlueprintDrag(evt : DragEvent) {
        // Indicates we can drop here
        evt.preventDefault();
    }

    /**
     * Fired when something is dropped onto this target.
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
     * Read Only View Accessor
     * @return True, if a drop target for a new join should be shown.
     */
    get showBlueprintJoinDropTarget() {
        return (this.dragService.activeTable);
    }
}
