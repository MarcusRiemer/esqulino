import {Component, Input}               from 'angular2/core'

import {DragService, SqlDragEvent}      from './drag.service'
import {ExpressionComponent}            from './sql.expr.component'

import {Query, Model, SyntaxTree}       from '../../shared/query'

@Component({
    selector : 'sql-select',
    templateUrl : 'app/editor/query/templates/query-select.html',
    directives: [ExpressionComponent]
})
export class SelectComponent {
    @Input() select : SyntaxTree.Select;

    constructor(public dragService : DragService) {

    }

    onBlueprintDrag(evt : DragEvent) {
        // Indicates we can drop here
        evt.preventDefault();
    }

    onBlueprintDrop(evt : DragEvent) {
        // Indicates we can drop here
        evt.preventDefault();

        // Extract the new expression and append it
        const sqlEvt = <SqlDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));
        this.select.appendExpression(sqlEvt.expr);

        console.log(`Select.onBlueprintDrop:\n${this.select.toString()}`)
    }

    /**
     * Read Only View Accessor
     * @return True, if a drop target for a new column should be shown.
     */
    get showBlueprintDropTarget() {
        return (this.dragService.activeExpression);
    }
}

