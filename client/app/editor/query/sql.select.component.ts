import {Component, Input}               from 'angular2/core'

import {DragService}                    from './drag.service'
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

    onBlueprintColumnDrag(evt : DragEvent) {
        // Indicates we can drop here
        evt.preventDefault();
    }

    onBlueprintColumnDrop(evt : DragEvent) {
        // Indicates we can drop here
        evt.preventDefault();

        const table = evt.dataTransfer.getData("table");
        const column = evt.dataTransfer.getData("column");

        this.select.appendColumn(table, column);
    }

    /**
     * Read Only View Accessor
     * @return True, if a drop target for a new column should be shown.
     */
    get showBlueprintDropTarget() {
        return (this.dragService.activeColumn);
    }
}

