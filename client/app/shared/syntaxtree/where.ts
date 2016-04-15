import {Model, Query}          from '../query'

import {
    ColumnExpression, loadExpression
} from './expression'
import {
    Component, Expression, ExpressionParent, RemovableHost, Removable
} from './common'


/**
 * The SQL WHERE clause with at least one expression and 
 * 0..n subsequent conditions.
 */
export class Where extends Component implements ExpressionParent, Removable {

    private _first : Expression;
    
    constructor(where : Model.Where, query : Query) {
        super(query);

        this._first = loadExpression(where.first, this);
    }

    /**
     * @return True, if all expressions are either complete or disabled.
     */
    get isComplete() : boolean {
        return (this._first.isComplete());
    }

    /**
     * The first expression this WHERE clause.
     */
    get first() : Expression {
        return (this._first);
    }

    toString() : string {
        return (`WHERE ${this._first.toString()}`);
    }

    toModel() : Model.Where {
        return ({
            first : this._first.toModel()
        });
    }

    replaceChild(formerChild : Expression, newChild : Expression) {
        if (this._first == formerChild) {
            this._first = newChild;
        } else {
            throw { err : "Not implemented" }
        }
    }

    removeChild(formerChild : Expression) {
        // Is this the only expression?
        if (this._first == formerChild) {
            // Then remove this expression instead of leaving
            // a dangling MissingExpression
            this.removeSelf();
        } else {
            throw { err : "Not implemented" }
        }
    }

    removeSelf() {
        this._query.removeChild(this);
    }

}

