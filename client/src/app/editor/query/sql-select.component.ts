import {Component, Input}               from '@angular/core'

import {DragService, SqlDragEvent}      from './drag.service'

import {QuerySelect, Model, SyntaxTree} from '../../shared/query'

@Component({
    selector : 'sql-select',
    templateUrl : 'templates/query-select.html'
})
export class SelectComponent {
    @Input() query : QuerySelect;

    constructor(public dragService : DragService) {

    }

    onColumnDragStart(expr : SyntaxTree.NamedExpression, evt : DragEvent) {
        this.dragService.startExistingExpressionDrag("select", evt, expr.expr);
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

        console.log(`Select.onBlueprintDrop:\n${this.select.toSqlString()}`)
    }

    /**
     * Read Only View Accessor
     * @return The SELECT part of the edited query.
     */
    get select() {
        return (this.query.select);
    }
    
    /**
     * Read Only View Accessor
     * @return True, if a drop target for a new column should be shown.
     */
    get showBlueprintDropTarget() {
        return (this.dragService.activeColumn) && ! (this.dragService.activeFromSelect);
    }
}

