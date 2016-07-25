import {Schema}                               from '../../schema'

import * as Model                             from '../description'
import {ValidationResult}                     from '../validation'
import {Query}                                from '../base'

import {
    ColumnExpression, loadExpression
} from './expression'
import {
    Component, Expression, ExpressionParent, RemovableHost, Removable
} from './common'

/**
 * All Expressions after the first in a WHERE clause need the
 * logical operation defined. This is redundant, as the 
 * BinaryExpression would be perfectly capable of expressing
 * arbitrarily deep nested logical expressions, but in that
 * case the UI would be less then thrilling.
 */
export class WhereSubsequent extends Component implements ExpressionParent, Removable {
    private _expr : Expression;
    private _operator : Model.LogicalOperator;
    private _where : Where;

    constructor(where : Where, model : Model.WhereSubsequent) {
        super(where.query);

        this._expr = loadExpression(model.expr, this);
        this._operator = model.logical;
        this._where = where;
    }

    /**
     * @return The expression that is evalueted in this component.
     */
    get expr() : Expression {
        return (this._expr);
    }

    /**
     * @return The logical operator that is used to tie this expression
     *         to the rest of the WHERE component.
     */
    get operator() {
        return (this._operator);
    }

    validate(schema : Schema) : ValidationResult {
        // Ask the child expression wether it is valid
        return (this._expr.validate(schema));
    }

    toSqlString() : string {
        return(`${this._operator} ${this._expr.toSqlString()}`);
    }

    getLocationDescription() : string {
        return (`WHERE:${this.operator}`);
    }

    toModel() : Model.WhereSubsequent {
        return ({
            expr : this._expr.toModel(),
            logical : this._operator
        });
    }

    replaceChild(formerChild : Expression, newChild : Expression) {
        if (this._expr == formerChild) {
            this._expr = newChild;
        } else {
            throw new Error("Attempted to remove non-existant expr on subsequent where");
        }
    }

    removeChild(formerChild : Expression) {
        if (this._expr == formerChild) {
            this.removeSelf();
        }
    }

    removeSelf() {
        this._where.removeChild(this._expr);
    }
}

/**
 * The SQL WHERE clause with at least one expression and 
 * 0..n subsequent conditions.
 */
export class Where extends Component implements ExpressionParent, Removable {

    private _first : Expression;
    private _subsequent : WhereSubsequent[];
    
    constructor(where : Model.Where, query : Query) {
        super(query);

        // The first expression is guaranteed to be present
        this._first = loadExpression(where.first, this);

        if (where.following) {
            // Load all following expressions
            this._subsequent = where.following.map(m => new WhereSubsequent(this, m));
        } else {
            // No subsequent expressions
            this._subsequent = [];
        }
    }

    /**
     * @return True, if all expressions are complete.
     */
    validate(schema : Schema) : ValidationResult {
        const children =
            [this._first.validate(schema)]
            .concat(this._subsequent.map(s => s.validate(schema)));
        
        return (new ValidationResult([], children));
    }

    /**
     * @return All expression that are not the first.
     */
    get subsequent() {
        return (this._subsequent);
    }

    /**
     * The first expression this WHERE clause.
     */
    get first() : Expression {
        return (this._first);
    }

    getLocationDescription() : string {
        return (`WHERE`);
    }

    /**
     * Append a new expresion to this component. This will always result
     * in a subsequent expression, no matter what the first expression
     * is currently set to.
     *
     * @expr The model of the expression to add
     * @op   The logical operator
     */
    appendExpression(expr : Model.Expression, op : Model.LogicalOperator) {     
        this._subsequent.push(new WhereSubsequent(this, {
            expr : expr,
            logical : op
        }));
    }

    toSqlString() : string {
        let toReturn = `WHERE ${this._first.toSqlString()}`;

        this._subsequent.forEach(s => {
            toReturn += `\n\t${s.toSqlString()}`;
        });
        
        return (toReturn);
    }

    toModel() : Model.Where {
        let toReturn : Model.Where = {
            first : this._first.toModel()
        };

        if (this._subsequent.length > 0) {
            toReturn.following = this._subsequent.map(s => s.toModel());
        }

        return (toReturn);
    }

    getLeaves() : Expression[] {
        const nestedLeaves = this.subsequent.map(s => s.expr.getLeaves());
        const flatLeaves = [].concat.apply([], nestedLeaves);

        return (flatLeaves.concat(this._first.getLeaves()));
    }

    replaceChild(formerChild : Expression, newChild : Expression) {
        if (this._first == formerChild) {
            this._first = newChild;
        } else {
            throw new Error("Not implemented");
        }
    }

    /**
     * Removes an expression (that may be wrapped in a subsequent component).
     * If the first expressions is removed, the first subsequent expression
     * moves "up". If the last expression is removed, the whole WHERE clause
     * is removed.
     *
     * @param formerChild The expression to remove
     */
    removeChild(formerChild : Expression) {
        // Is this the only expression?
        if (this._first == formerChild && this._subsequent.length == 0) {
            // Then remove this expression instead of leaving
            // a dangling MissingExpression
            this.removeSelf();
        } else {
            // Should we remove the first expression?
            if (this._first == formerChild) {
                // Take the first subsequent expression as new first
                this._first = this._subsequent.pop().expr;
            } else {
                // Find out which subsequent expression to remove
                const removalIndex = this._subsequent.findIndex(s => s.expr == formerChild);
                if (removalIndex >= 0) {
                    this._subsequent.splice(removalIndex, 1);
                } else {
                    throw new Error("Could not find subsequent expression");
                }
            }
        }
    }

    removeSelf() {
        this._query.removeChild(this);
    }

}

