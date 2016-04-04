import {Component, Input}               from 'angular2/core'

import {DragService}                    from './drag.service'

import {Query, Model, SyntaxTree}       from '../../shared/query'

@Component({
    selector : 'sql-expr',
    templateUrl : 'app/editor/query/templates/query-expr.html',
    directives: [ExpressionComponent]
})
export class ExpressionComponent {
    @Input() expr : SyntaxTree.Expression;
    @Input() query : Query;

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

    onMissingDrop(evt : DragEvent) {
        // Without this prevention firefox will redirect the page to
        // the drop data.
        evt.preventDefault();

        // Remove visual dragging indicator
        this._currentDragOver = false;

        // Actually replace the current node
        this.expr.replaceSelf({
            constant : {
                type : "INTEGER",
                value : "13"
            }
        });

        // Logging the changes
        const sqlString = this.query.toSqlString();
        console.log(`onMissingDrop:\n${sqlString}`)
    }

    onConstantDrop(evt : DragEvent) {
        // Without this prevention firefox will redirect the page to
        // the drop data.
        evt.preventDefault();

        // Remove visual dragging indicator
        this._currentDragOver = false;

        // Actually replace the current node
        this.expr.replaceSelf({
            constant : {
                type : "INTEGER",
                value : "13"
            }
        });

        // Logging the changes
        const sqlString = this.query.toSqlString();
        console.log(`onConstantDrop:\n${sqlString}`)
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

