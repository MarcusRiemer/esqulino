import {Subject}                                     from 'rxjs/Subject'
import {Observable}                                  from 'rxjs/Observable'

import {TableDescription}                            from '../../schema'
import {ModelObservable}                             from '../../interfaces'

import * as Model                                    from '../description'
import {Query}                                       from '../base'

import { Expression, loadExpression }                from './expression'

export { Expression, loadExpression }

/**
 * A part of an SQL expression that can remove it's own reference from
 * the parenting query "thing".
 */
export interface Removable {

    /**
     * Remove this instance from its parent. It is the job of the parent
     * to decide how to fill the void.
     */
    removeSelf() : void;
}

/**
 * Something that can host something that could remove itself. This is
 * most likely an expression or a component, but could also be something 
 * non-functional like a comment.
 */
export interface RemovableHost {
    /**
     * Removes a child of this expression. This is used by
     * outside components, which need a way to change the structure
     * of a query whilst leaving the "root pointer" intact.
     *
     * This method may replace the formerChild with a MissingExpression
     * or recursively remove itself.
     *
     * @param formerChild The instance that previously was a child
     */
    removeChild(formerChild : Removable) : void;
}

/**
 * Something that can reason about it's place in the AST.
 */
export interface Locateable {
    /**
     * Calculates a human-readable representation of the location
     * where the expression can be found.
     */
    getLocationDescription() : string;
}

/**
 * Something that is able to host an expression.
 */
export interface ExpressionParent extends RemovableHost, Locateable {
    /**
     * Replaces a child of this expression. This is used by
     * outside components, which need a way to change the structure
     * of a query whilst leaving the "root pointer" intact.
     *
     * @param formerChild The instance that previously was a child
     * @param newChild    The instance that should take the place
     */
    replaceChild(formerChild : ExpressionParent, newChild : ExpressionParent) : void;
}

/**
 * Base class for all components of an SQL Statement (SELECT,
 * FROM, WHERE, GROUP BY, HAVING, ORDER BY). Additionally, this
 * models top level AND and OR conjunctions as top level components,
 * because this eases development for beginners.
 */
export abstract class Component implements ModelObservable<Component> {
    // The query this component is part of
    protected _query : Query;

    // Fired when the internal model has changed
    private _modelChanged = new Subject<Component>();

    constructor(query : Query) {
        this._query = query;

        if (query) {
            this.modelChanged.subscribe(_ => query.markSaveRequired())
        }
    }
    
    /**
     * Fired when something about this model has changed.
     */
    get modelChanged() : Observable<Component> {
        return (this._modelChanged);
    }

    /**
     * Allows implementing classes to signal that their model has changed.
     */
    fireModelChange() {
        this._modelChanged.next(this);
    }

    /**
     * @return The query this component belongs to.
     */
    get query() : Query {
        return (this._query);
    }
    
    /**
     * @return SQL String representation
     */
    abstract toSqlString() : string;

    /**
     * @return JSON model representation
     */
    abstract toModel() : any;
}

