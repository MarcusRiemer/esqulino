import {Component, Input}               from 'angular2/core'

import {DragService}                    from './drag.service'
import {ExpressionComponent}            from './sql.expr.component'

import {QueryWhere, Model, SyntaxTree}  from '../../shared/query'

@Component({
    selector : 'sql-where',
    templateUrl : 'app/editor/query/templates/query-where.html',
    directives: [ExpressionComponent]
})
export class WhereComponent {
    @Input() query : QueryWhere;

    constructor(public dragService : DragService) {

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
    onBlueprintDrop(evt : DragEvent) {
        // Make sure that no redirection to the data associated with
        // the drop target occurs
        evt.preventDefault();

        // Introduce a "dummy" where element if it does not yet exist
        if (!this.query.where) {
            this.query.where = new SyntaxTree.Where({
                first : { missing : { } }
            }, this.query);
        }

        // Add a binary expression
        this.query.where.first.replaceSelf({
            binary : {
                lhs : { missing : { } },
                operator : "=",
                rhs : { missing : { } },
                simple : true
            }
        });

        console.log(`onBlueprintDrop:\n${this.query.toSqlString()}`)
    }

    /**
     * Read Only View Accessor
     * @return True, if a drop target for a new column should be shown.
     */
    get showBlueprintDropTarget() {
        return (this.query.where == null && this.dragService.activeCompound);
    }
}
