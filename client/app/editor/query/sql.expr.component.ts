import {Component, Input}               from 'angular2/core'

import {DragService, SqlDragEvent}      from './drag.service'

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
     *
     */
    onAllowedDrag(evt : DragEvent) {
        // Indicates we can drop here
        evt.preventDefault();

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
     * Something has been dropped onto a constant value
     */
    onExpressionDragStart(evt : DragEvent) {
        this._dragService.startExistingExpressionDrag("query", evt, this.expr);
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

        // Remove visual dragging indicator
        this._currentDragOver = false;

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

        if (this._dragService.activeSource) {
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

