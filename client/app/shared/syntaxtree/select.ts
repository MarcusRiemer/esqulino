import {Model}              from '../query.model'

import {
    ColumnExpression, loadExpression
} from './expression'
import {
    Component, Expression, ExpressionParent
} from './common'

export { ColumnExpression };

/**
 * Allows an expression to be named, typically in "SELECT <expr> AS <name>"
 * contexts.
 */
interface NamedExpression {
    name? : string;
    expr : Expression;
}

/**
 * A select statement with a list of column expressions.
 */
export class Select extends Component implements ExpressionParent {
    private _columns : NamedExpression[] = [];

    /**
     * If this is set to true, a "*" operator is appended
     * to the column expressions.
     */
    private _allData : boolean;

    constructor(select : Model.Select) {
        super();

        this._allData = !!select.allData;
        
        // Mapping the model types to concrete instances of the
        // syntax tree.
        select.columns.forEach(v => {
            var toAdd : NamedExpression = {
                name : v.as,
                expr : loadExpression(v.expr, this)
            };

            this._columns.push(toAdd);
        });
    }

    /**
     * If neither a column is specified nor all columns should be
     * selected, the query can't be represented in SQL.
     *
     * @return True, if this query is completly defined
     */
    isComplete() : boolean {
        return (this.numberOfColumns == 0 && !this._allData);
    }

    /**
     * Appends a new column to this SELECT statement
     *
     * @param table The name of the table the column belongs to
     * @param column The name of the column itself
     * @param as The alias name for this column
     */
    appendColumn(table : string, column : string, as? : string) {
        return (this.appendExpression({
            singleColumn : {
                column : column,
                table : table
            }
        }, as));
    }

    appendExpression(expr : Model.Expression, as? : string) {
        // Load the model of the expression
        let toAdd : NamedExpression = {
            expr : loadExpression(expr, this)
        }

        // Possibly add the name
        if (as) {
            toAdd.name = as;
        }

        // Actually store the column
        this._columns.push(toAdd);

        return (toAdd);
    }

    /**
     * @return The number of columns this select statement retrieves
     */
    get numberOfColumns() {
        return (this._columns.length);
    }

    /**
     * @return The column with index i
     */
    getColumn(i : number) {
        return this._columns[i].expr;
    }

    /**
     * @return The alias for column i
     */
    getAlias(i : number) {
        return this._columns[i].name;
    }

    /**
     * @return All columns
     */
    get columns() : NamedExpression[] {
        return (this._columns);
    }

    get allData() : boolean {
        return (this._allData);
    }

    /**
     * @return "SELECT [columns]"
     */
    toString() : string {
        if (this.isComplete()) {
            throw { "err" : "No columns and not using all columns" }
        }
        
        // We start of with the normal keyword and DO NOT
        // add a trailing space as this will be inserted
        // in the loop below.
        var toReturn = "SELECT";

        // Possibly add leading "*" Operator
        if (this._allData) {
            if (this.columns.length > 0) {
                toReturn += " *,";
            } else {
                toReturn += " *";
            }
        }

        // And add all those columns
        this._columns.forEach((c, i) => {
            // Comma squibbling for every column except
            // the first.
            if (i != 0) {
                toReturn += ",";
            }

            // Every column is separated by a single space
            toReturn += " " + c.expr.toString();

            // Optionally, there may be an alias name for the column
            if (c.name) {
                toReturn += ` AS ${c.name}`;
            }
        });

        return (toReturn);
    }

    toModel() : Model.Select {
        const toReturn = this._columns.map( v => {
            const core : Model.SelectColumn = {
                expr : v.expr.toModel()
            }

            if (v.name) {
                core.as = v.name;
            }
            
            return (core);
        });
        
        return ({
            columns : toReturn,
            allData : this._allData
        });
    }

    replaceChild(formerChild : Expression, newChild : Expression) {
        throw {
            err : "Not implemented"
        }
    }

    removeChild(formerChild : Expression) {
        throw {
            err : "Not implemented"
        }
    }
}

