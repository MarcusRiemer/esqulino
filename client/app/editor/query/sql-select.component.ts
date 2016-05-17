import {Component, Input}               from '@angular/core'

import {DragService, SqlDragEvent}      from './drag.service'
import {ExpressionComponent}            from './sql-expr.component'

import {QuerySelect, Model, SyntaxTree} from '../../shared/query'
import {NamedExpression}                from '../../shared/syntaxtree/select'

@Component({
    selector : 'sql-select',
    templateUrl : 'app/editor/query/templates/query-select.html',
    directives: [ExpressionComponent]
})
export class SelectComponent {
    @Input() query : QuerySelect;

    constructor(public dragService : DragService) {

    }

    onColumnDragStart(expr : NamedExpression, evt : DragEvent) {
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

        console.log(`Select.onBlueprintDrop:\n${this.select.toString()}`)
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

