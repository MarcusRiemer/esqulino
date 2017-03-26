import {Component, Input}               from '@angular/core'

import {DragService, SqlDragEvent}      from './drag.service'

import {Query, Model, SyntaxTree}       from '../../shared/query'

@Component({
    selector : 'sql-where',
    templateUrl : 'templates/query-where.html',
})
export class WhereComponent {
    @Input() query : Query;

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
     * Fired when something is dropped onto the WHERE bluperint
     */
    onBlueprintWhereDrop(evt : DragEvent) {
        // Make sure that no redirection to the data associated with
        // the drop target occurs
        evt.preventDefault();

        // Grab the actual sql drag event
        const sqlEvt = <SqlDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));

        // Introduce a "dummy" where element if it does not yet exist.
        if (!this.query.where) {
            this.query.where = new SyntaxTree.Where({
                first : { missing : { } },
                following : []
            }, this.query);
        }

        // Add the correct expression, the WHERE component is guaranteed
        // to exist now.
        this.query.where.first.replaceSelf(sqlEvt.expr);
    }

    /**
     * Fired when something is dropped onto the WHERE bluperint
     */
    onBlueprintSubsequentDrop(evt : DragEvent, logical : Model.LogicalOperator) {
        // Make sure that no redirection to the data associated with
        // the drop target occurs
        evt.preventDefault();

        // Double check the UI has sent in a sensible operation
        if (logical != <Model.LogicalOperator>"AND"
            && logical != <Model.LogicalOperator>"OR") {
            throw new Error("Expected logical operator");
        }

        // Grab the actual sql drag event
        const sqlEvt = <SqlDragEvent> JSON.parse(evt.dataTransfer.getData('text/plain'));

        // And append something
        this.query.where.appendExpression(sqlEvt.expr, logical);
    }

    /**
     * Read Only View Accessor
     * @return True, if a drop target for the WHERE component should be shown.
     */
    get showBlueprintWhere() {
        return (this.query.where == null && this.dragService.activeCompound);
    }

    /**
     * Read Only View Accessor
     * @return True, if a drop target for a subsequent AND or OR should be shown.
     */
    get showBlueprintSubsequent() {
        return (this.query.where != null && this.dragService.activeCompound);
    }
}
