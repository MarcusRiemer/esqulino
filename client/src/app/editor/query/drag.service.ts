import {Subject}                from 'rxjs/Subject'

import {Injectable}             from '@angular/core'

import {TrashService}           from '../shared/trash.service'

import {
    Model, SyntaxTree, ResultColumn
} from '../../shared/query'

/**
 * The scopes a drag event could affect
 */
export type ScopeFlag = "expr" | "column" | "constant" | "parameter" | "compound" | "operator" | "table" | "star";
export type OriginFlag = "select"| "from" | "where" | "delete" | "sidebar";

/**
 * Abstract information about the drag event.
 */
export interface SqlDragEvent {
    scope : ScopeFlag[]
    origin : OriginFlag
    expr? : Model.Expression
    join? : Model.Join
    operator? : Model.Operator
}

/**
 * Coordinates dragging events among all components that make use of
 * drag & drop to construct queries. This is the shared state that
 * is required to make things work out correctly.
 */
@Injectable()
export class DragService {
    private _eventSource : Subject<SqlDragEvent>;

    private _currentDrag : SqlDragEvent;

    // This seems like an awful hack, but here we go:
    // Because it isn't possible to put references to actual Javascript
    // Objects into the Drag & Drop events, the source reference needs
    // to be stored elsewhere. This property comes into play, when any
    // kind of operation needs to occur at the "origin" end in reaction
    // to a drag & drop operation.
    private _currentSource : SyntaxTree.Removable;

    constructor(private _trashService : TrashService) {
        this._eventSource = new Subject<SqlDragEvent>();
    }

    /**
     * Starts a drag operation for the given scope.
     *
     * @param scope The scope that the dragged item matches.
     */
    private dragStart(evt : DragEvent, sqlEvt : SqlDragEvent, source? : SyntaxTree.Removable) {
        // There can only be a single drag event at once
        if (this._currentDrag || this._currentSource) {
            throw new Error ("Attempted to start a second drag");
        }
        
        this._currentDrag = sqlEvt;
        this._currentSource = source;

        // Serialize the dragged "thing"
        const dragData = JSON.stringify(this._currentDrag);
        evt.dataTransfer.setData('text/plain', dragData);

        if (source) {
            this._trashService.showTrash( _ => {
                source.removeSelf();
            });
        }
        
        // We are only interested in the top level drag element, if
        // we wouldn't stop the propagation, the parent of the current
        // drag element would fire another dragstart.
        evt.stopPropagation();

        // Controls how the mouse cursor looks when hovering over
        // allowed targets.
        if (sqlEvt.origin == "sidebar") {
            evt.dataTransfer.effectAllowed = 'copy';
        } else {
            evt.dataTransfer.effectAllowed = 'move';
        }

        // Reset everything once the operation has ended
        evt.target.addEventListener("dragend", () => {
            this._currentDrag = null;
            this._currentSource = null;
            console.log(`Query-Drag ended: ${dragData}`);
        });

        console.log(`Query-Drag started: ${dragData}`);
    }

    /**
     * Calculates the scope flags for an expression model.
     *
     * @param model The expression model we want to scope.
     *
     * @return A list of scopes matching the model.
     */
    private calculateScopeFlags(model : Model.Expression) {
        let scope : ScopeFlag[] = ["expr"];
        if (model.binary) {
            scope.push("compound");
        } else if (model.constant) {
            scope.push("constant");
        } else if (model.parameter) {
            scope.push("parameter");
        } else if (model.singleColumn) {
            scope.push("column");
        } else if (model.star) {
            scope.push("column");
            scope.push("star");
        }

        return (scope);
    }

    /**
     * Start dragging an arbitrary expression, which may or may not have
     * some kind of source attached.

     * @param model The model to insert at the drop location
     * @param origin The logical source of this operation
     * @param evt The DOM drag event to enrich
     * @param source A node that is associated as a logical source.
     */
    startExpressionModelDrag(model : Model.Expression,
                             origin : OriginFlag,
                             evt : DragEvent,
                             source? : SyntaxTree.Removable) {
        this.dragStart(evt, {
            scope : this.calculateScopeFlags(model),
            origin : origin,
            expr : model
        }, source);
    }

    /**
     * Start to drag an existing expression.
     *
     * @param origin The logical source of this operation
     * @param evt The DOM drag event to enrich
     */
    startExistingExpressionDrag(origin : OriginFlag,
                                evt : DragEvent,
                                expr : SyntaxTree.Expression) {
        this.startExpressionModelDrag(expr.toModel(), origin, evt, expr);
    }

    /**
     * Starts a drag event involving a constant
     *
     * @param origin The logical source of this operation
     * @param evt The DOM drag event to enrich
     */
    startConstantDrag(origin : OriginFlag,
                      evt : DragEvent,
                      source? : SyntaxTree.Removable) {        
        this.startExpressionModelDrag({
            constant : {
                type : "INTEGER",
                value : "1"
            }
        }, origin, evt, source);
    }

    /**
     * Starts a drag event involving a column
     *
     * @param origin The logical source of this operation
     * @param evt The DOM drag event to enrich
     */
    startColumnDrag(table : string,
                    column : string,
                    origin : OriginFlag,
                    evt : DragEvent,
                    source? : SyntaxTree.Removable) {
        this.startExpressionModelDrag({
            singleColumn : {
                column : column,
                table : table
            }
        }, origin, evt, source);
    }

    /**
     * Starts a drag event involving a compound expression
     *
     * @param evt The DOM drag event to enrich
     */
    startCompoundDrag(operator : Model.Operator,
                      origin : OriginFlag,
                      evt : DragEvent,
                      source? : SyntaxTree.Removable) {
        this.startExpressionModelDrag({
            binary : {
                lhs : { missing : { } },
                rhs : { missing : { } },
                operator : operator,
                simple : true
            }
        }, origin, evt, source);
    }

    /**
     * Starts a drag event involving only an operator
     *
     * @param operator The operator to drag
     * @param evt The DOM drag event to enrich
     */
    startOperatorDrag(operator : Model.Operator,
                      origin : OriginFlag, evt : DragEvent) {
        this.dragStart(evt, {
            operator : operator,
            origin : origin,
            scope : ["operator"]
        });
    }

    /**
     * Starts a drag event involving a parameter expression
     *
     * @param evt The DOM drag event to enrich
     */
    startParameterDrag(origin : OriginFlag,
                       evt : DragEvent,
                       source? : SyntaxTree.Removable) {
        this.startExpressionModelDrag({
            parameter : {
                key : "key"
            }
        }, origin, evt, source);
       
    }

    /**
     * Starts a drag event involving a table.
     *
     * @param evt The DOM drag event to enrich
     */
    startTableDrag(join : Model.Join,
                   origin : OriginFlag,
                   evt : DragEvent,
                   source? : SyntaxTree.Removable) {
        this.dragStart(evt, {
            scope : ["table"],
            origin : origin,
            join : join
        }, source);
    }

    get activeOrigin() : OriginFlag | "" {
        return (this._currentDrag && this._currentDrag.origin)
    }

    /**
     * @return True, if the current drag operation originated in the query
     */
    get activeFromQuery() : boolean {
        return (this._currentDrag && this._currentDrag.origin != <OriginFlag>"sidebar");
    }

    /**
     * @return True, if the current drag operation originated in the SELECT of a query.
     */
    get activeFromSelect() : boolean {
        return (this._currentDrag && this._currentDrag.origin == <OriginFlag>"select");
    }

    /**
     * @return True, if the current drag operation originated in the FROM component of a query.
     */
    get activeFromFrom() : boolean {
        return (this._currentDrag && this._currentDrag.origin == <OriginFlag>"from");
    }

    /**
     * @return True, if the current drag operation originated in the WHERE component of a query.
     */
    get activeFromWhere() : boolean {
        return (this._currentDrag && this._currentDrag.origin == <OriginFlag>"where");
    }

    /**
     * @return True, if the current drag operation originated in the sidebar
     */
    get activeFromSidebar() : boolean {
        return (this._currentDrag && this._currentDrag.origin == <OriginFlag>"sidebar");
    }

    /**
     * @return True, if a expression is involved in the current drag operation
     */
    get activeExpression() : boolean {
        return (this._currentDrag && this._currentDrag.scope.indexOf("expr") >= 0);
    }

    /**
     * @return True, if a constant is involved in the current drag operation
     */
    get activeConstant() : boolean {
        return (this._currentDrag && this._currentDrag.scope.indexOf("constant") >= 0);
    }

    /**
     * @return True, if a column is involved in the current drag operation
     */
    get activeColumn() : boolean {
        return (this._currentDrag && this._currentDrag.scope.indexOf("column") >= 0);
    }

    /**
     * @return True, if an operator is involved in the current drag operation
     */
    get activeOperator() : boolean {
        return (this._currentDrag && this._currentDrag.scope.indexOf("operator") >= 0);
    }

    /**
     * @return True, if a column is involved in the current drag operation
     */
    get activeCompound() : boolean {
        return (this._currentDrag && this._currentDrag.scope.indexOf("compound") >= 0);
    }

    /**
     * @return True, if a table is involved in the current drag operation
     */
    get activeTable() : boolean {
        return (this._currentDrag && this._currentDrag.scope.indexOf("table") >= 0);
    }

    /**
     * @return The source of the drag operation.
     */
    get activeSource() : SyntaxTree.Removable {
        return (this._currentSource);
    }
}
