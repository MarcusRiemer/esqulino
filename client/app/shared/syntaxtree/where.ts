import {Model}              from '../query.model'

import {
    ColumnExpression, loadExpression
} from './expression'
import {
    Component, Expression, ExpressionParent
} from './common'


/**
 * The SQL WHERE clause with at least one expression and 
 * 0..n subsequent conditions.
 */
export class Where extends Component implements ExpressionParent {

    private _first : Expression;
    
    constructor(where : Model.Where) {
        super();

        this._first = loadExpression(where.first, this);
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

}

