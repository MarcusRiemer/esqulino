import {Component, Input}               from '@angular/core'

import {
    DragService, SqlDragEvent, OriginFlag
} from './drag.service'

import {OperatorPipe}                   from './operator.pipe'

import {
    Query, Model, SyntaxTree
} from '../../shared/query'

@Component({
    selector: 'sql-expr',
    templateUrl: 'templates/query-expr.html',
})
export class ExpressionComponent {
    @Input() expr : SyntaxTree.Expression;
    @Input() query : Query;

    // Only used for column expressions.
    @Input() prefixTable = true;
    
    /**
     * Constructor for dependency injection.
     */
    constructor(private _dragService : DragService) {
    }

    /**
     * Read Only View Variable:
     * Is something currently dragging above this expression?
     */
    private _currentDragOver : boolean = false;

    /**
     * Searches for the kind of the top-level host of a certain expression.
     *
     * @param given The expression whose top-level component needs to be determined
     *
     * @return The type of the top-level component
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
        } else if (expr instanceof SyntaxTree.Delete) {
            return ("delete");
        }

        throw new Error(`Unknown drag origin: ${JSON.stringify(expr)}`);
    }

    onOperatorClick() {
        console.log("Operator clicked");
    }
    
    /**
     *
     */
    onAllowedDrag(evt : DragEvent) {
        // Only the binary expression takes things that
        // are not expressions.
        if (!(this.expr instanceof SyntaxTree.BinaryExpression) &&
            !this._dragService.activeExpression) {
            return;
        }

        // And the thing it takes are only operators
        if (this.expr instanceof SyntaxTree.BinaryExpression &&
            !this._dragService.activeOperator) {
            return;
        }
       
        // Indicates we can drop here
        evt.preventDefault();
        evt.cancelBubble = true;
        
        this._currentDragOver = true;

        console.log("Drag Enter");
    }

    /**
     *
     */
    onAllowedDragLeave(evt : DragEvent) {
        console.log("Drag Leave");
        this._currentDragOver = false;
    }

    /**
     * Something has been dropped onto a missing value
     */
    onMissingDrop(evt : DragEvent) {
        console.log("Missing Drop");
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
        console.log("Dropped Binary");
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

        // It could be a new operator
        if (sqlEvt.operator) {
            // Which is only valid for a binary expression
            if (this.expr instanceof SyntaxTree.BinaryExpression) {
                (this.expr as SyntaxTree.BinaryExpression).operator = sqlEvt.operator;
            }
        }
        // Or an expression
        else if (sqlEvt.expr) {       
            // React according to the kind of the expression
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
        }

        // Compare the origins, remove only if the have the same origin
        if (this._dragService.activeSource &&
            this.getDragOrigin(this.expr) === this._dragService.activeOrigin) {
            this._dragService.activeSource.removeSelf();
        }

        // Logging the changes
        if (this.query.isValid) {
            // Query is complete, show it
            const sqlString = this.query.toSqlString();
            console.log(`onReplaceSameLevel:\n${sqlString}`)
        } else {
            console.log(`onReplaceSameLevel: Query is not complete`);
        }
    }

    /**
     * Read Only Accessor
     * @return Whether this expression is currently the relevant drop target.
     */
    get isCurrentDropTarget() : boolean {
        return (this._currentDragOver);
    }
}

