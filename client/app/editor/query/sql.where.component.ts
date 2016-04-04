import {Component, Input}               from 'angular2/core'

import {DragService}                    from './drag.service'
import {ExpressionComponent}            from './sql.expr.component'

import {Query, Model, SyntaxTree}       from '../../shared/query'

@Component({
    selector : 'sql-where',
    templateUrl : 'app/editor/query/templates/query-where.html',
    directives: [ExpressionComponent]
})
export class WhereComponent {
    @Input() query : Query;

    constructor(public dragService : DragService) {

    }

    onBlueprintDrag(evt : DragEvent) {
        // Indicates we can drop here
        evt.preventDefault();
    }

    onBlueprintDrop(evt : DragEvent) {
        // Indicates we can drop here
        evt.preventDefault();

        // Introduce a "dummy" where element if it does not yet exist
        if (!this.query.where) {
            this.query.where = new SyntaxTree.Where({
                first : { missing : { } }
            });
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
    }

    /**
     * Read Only View Accessor
     * @return True, if a drop target for a new column should be shown.
     */
    get showBlueprintDropTarget() {
        return (this.dragService.activeCompound);
    }
}
