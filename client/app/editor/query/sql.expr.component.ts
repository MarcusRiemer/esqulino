import {Component, Input}               from 'angular2/core'

import {
    DragService, SqlDragEvent, OriginFlag
} from './drag.service'

import {Query, Model, SyntaxTree}       from '../../shared/query'

@Component({
    selector : 'sql-expr',
    templateUrl : 'app/editor/query/templates/query-expr.html',
    directives: [ExpressionComponent]
})
export class ExpressionComponent {
    @Input() expr : SyntaxTree.Expression;
    @Input() query : Query;

    constructor(private _dragService : DragService) {
    }

    /**
     * View Variable:
     * Is this expression in editing mode?
     */
    isEditing = false;

    /**
     * Read Only View Variable:
     * Is something currently dragging above this expression?
     */
    private _currentDragOver : boolean = false;

    /**
     * Searches for the top-level host of a certain expression.
     */
    private getDragOrigin(given : SyntaxTree.Expression) : OriginFlag {
        // We don't care about the type too much during the search,
        // but the final type will NOT be an expression.
        let expr : any = given;

        while (expr instanceof SyntaxTree.Expression) {
            expr = expr.parent;
        }

        if (expr instanceof SyntaxTree.Select) {
            return ("select");
        } else if (expr instanceof SyntaxTree.From) {
            return ("from");
        } else if (expr instanceof SyntaxTree.Where ||
                   expr instanceof SyntaxTree.WhereSubsequent) {
            return ("where");
        }

        throw new Error(`Unknown drag origin: ${JSON.stringify(expr)}`);
    }
    
    /**
     *
     */
    onAllowedDrag(evt : DragEvent) {
        // Indicates we can drop here
        evt.preventDefault();
        evt.cancelBubble = true;
        
        this._currentDragOver = true;
    }

    /**
     *
     */
    onAllowedDragLeave(evt : DragEvent) {
        this._currentDragOver = false;
    }

    /**
     * Something has been dropped onto a missing value
     */
    onMissingDrop(evt : DragEvent) {
        this.replaceWithDragged(evt);
    }

    /**
     * Something has been dropped onto a star expression
     */
    onStarDrop(evt : DragEvent) {
        this.replaceWithDragged(evt);
    }

    /**
     * Something has been dropped onto a column
     */
    onColumnDrop(evt : DragEvent) {
        this.replaceWithDragged(evt);
    }

    /**
     * Something has been dropped onto a constant value
     */
    onConstantDrop(evt : DragEvent) {
        this.replaceWithDragged(evt);
    }

    /**
     * Something has been dropped onto a binary expression
     */
    onBinaryDrop(evt : DragEvent) {
        this.replaceWithDragged(evt);
    }


    /**
     * Something has been dropped where this was not anticipated
     */
    onFallbackDrop(evt : DragEvent) {
        // Without this prevention firefox will redirect the page to
        // the drop data.
        evt.preventDefault();

        console.log("Unexpected drop");
    }

    /**
     * Something has been dropped onto a constant value
     */
    onExpressionDragStart(evt : DragEvent) {
        const scope = this.getDragOrigin(this.expr);
        this._dragService.startExistingExpressionDrag(scope, evt, this.expr);
    }

    /**
     * Something has been dropped onto a constant value
     */
    onParameterDrop(evt : DragEvent) {
        this.replaceWithDragged(evt);
    }

    /**
     * Replaces the current expression with the given expression.
     */
    private replaceWithDragged(evt : DragEvent) {
        // Without this prevention firefox will redirect the page to
        // the drop data.
        evt.preventDefault();
        evt.cancelBubble = true;

        // Remove visual dragging indicator
        this._currentDragOver = false;

        // Chicken out early, if the drop target is the drag origin
        if (this.expr == this._dragService.activeSource) {
            console.log("Skipped drop on self");
            return;
        }

        // Grab the actual sql drag event
        const sqlEvt = <SqlDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));

        // And react according to the kind of the expression
        if (sqlEvt.expr.constant) {
            // A constant value
            let actualValue = sqlEvt.expr.constant.value;

            // But if it comes from the sidebar, the value is only a placeholder
            if (sqlEvt.origin === "sidebar") {
                actualValue = prompt("Wert?");
            }
            
            if (actualValue) {
                sqlEvt.expr.constant.value = actualValue;
                this.expr.replaceSelf(sqlEvt.expr);
            }
        } else if (sqlEvt.expr.parameter) {
            // A named parameter: But what's the name?
            const actualValue = prompt("Name?");
            if (actualValue) {
                sqlEvt.expr.parameter.key = actualValue;
                this.expr.replaceSelf(sqlEvt.expr);
            }
        } else {
            // Things that do not require any user interaction
            this.expr.replaceSelf(sqlEvt.expr);
        }

        // Compare the origins, remove only if the have the same origin
        if (this._dragService.activeSource &&
            this.getDragOrigin(this.expr) === this._dragService.activeOrigin) {
            this._dragService.activeSource.removeSelf();
        }

        // Logging the changes
        if (this.query.isComplete) {
            // Query is complete, show it
            const sqlString = this.query.toSqlString();
            console.log(`onReplaceSameLevel:\n${sqlString}`)
        } else {
            console.log(`onReplaceSameLevel: Query is not complete`);
        }
    }

    /**
     * Focus has been lost.
     */
    onBlur() {
        this.isEditing = false;
        // Logging the changes
        const sqlString = this.query.toSqlString();
        console.log(`onBlur:\n${sqlString}`)
    }

    /**
     * Read Only Accessor
     * @return Whether this expression is currently the relevant drop target.
     */
    get isCurrentDropTarget() : boolean {
        return (this._currentDragOver);
    }
}

