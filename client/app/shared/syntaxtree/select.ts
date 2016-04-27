import {Model, Query, QueryFrom}   from '../query'
import {TableDescription}          from '../schema.description'

import {
    ColumnExpression, StarExpression, loadExpression
} from './expression'
import {
    Component, Expression, ExpressionParent
} from './common'

export { ColumnExpression };

/**
 * Allows an expression to be named, typically in "SELECT <expr> AS <name>"
 * contexts.
 */
export interface NamedExpression {
    name? : string;
    expr : Expression;
}

/**
 * A select statement with a list of column expressions.
 */
export class Select extends Component implements ExpressionParent {
    private _columns : NamedExpression[] = [];

    constructor(select : Model.Select, query : Query) {
        super(query);
        
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
        return (this._columns.length > 0);
    }

    /**
     * Appends a new column to this SELECT statement. This is 
     * essentially a shortcut for the more general appendExpression 
     * method.
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

    /**
     * Appends a new expression to the SELECT component.
     *
     * @param expr The expression to add
     * @param as   The name of the expression
     *
     * @return The SyntaxTree node that matches the given model.
     */
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
     * Retrieves the number of columns that are involved in the SELECT
     * statement. The result depends on the schema, because the number 
     * of columns in the StarExpression can't be retrieved without
     * the schema.
     *
     * @return The number of columns this SELECT statement retrieves
     *
     * @pre Hosting query has a schema
     */
    get numberOfColumns() {
        // A star column may attribute to more then a single column
        return (this._columns.map( val => {
            if (val.expr instanceof StarExpression) {
                // The number of columns in the StarExpression depends
                // on the number of involved tables of the current schema.
                const starExpr = <StarExpression> val.expr;
                let tables : TableDescription[] = [];
                
                if (starExpr.isLimited) {
                    // If it is limited, only count that table
                    tables.push(this._query.schema.getTable(starExpr.limitedTable));
                } else {
                    // Otherwise count all used tables
                    let from = (<QueryFrom> this._query).from;

                    // Don't forget the first table
                    from.joins.concat(from.first).forEach( j => {
                        tables.push(this._query.schema.getTable(j.name))
                    });
                }

                // Combine number of all participating tables
                return (tables
                        .map( t => t.columns.length )
                        .reduce( (l,r) => l + r, 0));
            } else {
                // Every expression that is not a StarExpression only
                // add a single column.
                return (1);
            }
        })).reduce( (l,r) => l + r, 0);
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

    /**
     * @return "SELECT [columns]"
     */
    toString() : string {
        if (!this.isComplete()) {
            throw new Error("Query is not complete");
        }
        
        // We start of with the normal keyword and DO NOT
        // add a trailing space as this will be inserted
        // in the loop below.
        var toReturn = "SELECT";

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
            columns : toReturn
        });
    }

    /**
     * Replace an expression of this SELECT component.
     * 
     * @param formerChild The child to replace
     * @param newChild The child that takes the place.
     */
    replaceChild(formerChild : Expression, newChild : Expression) {
        const replaceIndex = this.columns.findIndex(v => v.expr === formerChild);
        if (replaceIndex >= 0) {
            this._columns[replaceIndex] = {
                expr : newChild
            };
        } else {
            throw new Error("Attempted to replace non-existant child");
        }
    }

    /**
     * Remove an expression from this SELECT component.
     * 
     * @param formerChild The child to remove
     */
    removeChild(formerChild : Expression) {
        const removalIndex = this.columns.findIndex(v => v.expr === formerChild);

        if (removalIndex >= 0) {
            this.columns.splice(removalIndex, 1);
        } else {
            throw new Error("Attempted to remove non-existant child");
        }
    }
}

