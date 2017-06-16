import {
    Schema, TableDescription, ColumnDescription
} from '../../schema'

import * as Model                             from '../description'
import {
    ValidationResult, ValidationErrors, ValidationError
} from '../validation'
import {
    Query, ResultColumn
} from '../base'

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
     * If no columns are specified at all or even a single column
     * consists of an invalid expression the whole SELECT
     * component is invalid.
     */
    validate(schema : Schema) : ValidationResult {
        // Are there any columns at all?
        if (this._columns.length === 0) {
            // No columns are not allowed
            return (new ValidationResult([
                new ValidationErrors.EmptySelect()
            ]));
        } else {
            // Any error in a child is also not allowed
            const children = this._columns.map(c => c.expr.validate(schema));
            const unique = this.validateUniqueColumnNames();
            return (new ValidationResult(unique, children));

            // No columns may share identical names
        }
    }

    /**
     * Ensures that all column names are unique.
     */
    validateUniqueColumnNames() : ValidationError[] {
        // Counting occurences of all full names
        let dupliq : { [name:string] : number } = {};

        this.actualColums
            .map(c => c.shortName)
            .forEach(c => {
                // Ensure there is an index available
                if (!dupliq[c]) {
                    dupliq[c] = 0;
                }

                // Increment the index
                dupliq[c]++;
            });

        // Warn about duplicate names
        // TODO: There should be a nicer way of doing this using then
        //       `keys` method, but for some reason Typescript doesn't like
        //       this and tells me:
        //       Property 'keys' does not exist on type '{ [name: string]: number; }'
        let toReturn : ValidationError[] = [];
        
        for (let key in dupliq) {
            if (dupliq.hasOwnProperty(key) && dupliq[key] > 1) {
                toReturn.push(new ValidationErrors.AmbiguousColumnName(key))
            }
        }

        return (toReturn);
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

    getLocationDescription() : string {
        return ("SELECT");
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
     * @pre Hosting query has a schema. If this is not the case, all unknown
     *      tables will not be counted.
     */
    get actualNumberOfColumns() {
        // A star column may attribute to more then a single column
        return (this._columns.map( val => {
            if (val.expr instanceof StarExpression) {
                // The number of columns in the StarExpression depends
                // on the number of involved tables of the current schema.
                const starExpr = <StarExpression> val.expr;
                let tables : TableDescription[] = [];

                if (starExpr.isLimited) {
                    // If it is limited, only count that table
                    tables.push(this._query.schema.getTable(starExpr.tableName));
                } else {
                    // Otherwise count all used tables
                    let from = this.query.from;

                    // Don't forget the first table
                    from.joins.concat(from.first).forEach( j => {
                        tables.push(this._query.schema.getTable(j.tableName))
                    });
                }

                // Combine number of all participating tables
                return (tables
                        .filter( t => !!t)
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
     * Retrieves the actual column names that are involved in the SELECT
     * statement. The result depends on the schema, because the exact
     * columns in the StarExpression can't be retrieved without
     * the schema.
     *
     * @return Descriptions of columns in this SELECT component.
     *
     * @pre Hosting query has a schema. If this is not the case the result
     *      will not contain any columns that do not have known tables
     */
    get actualColums() : ResultColumn[] {
        let toReturn : ResultColumn[] = [];

        this._columns.forEach( val => {
            // A star column may attribute to more then a single column
            if (val.expr instanceof StarExpression) {
                // The number of columns in the StarExpression depends
                // on the number of involved tables of the current schema.
                const starExpr = <StarExpression> val.expr;
                let tables : TableDescription[] = [];

                if (starExpr.isLimited) {
                    // If it is limited, only count that table
                    tables.push(this._query.schema.getTable(starExpr.tableName));
                } else {
                    // Otherwise count all used tables
                    let from = this.query.from;

                    // Don't forget the first table
                    [from.first].concat(from.joins).forEach( j => {
                        tables.push(this._query.schema.getTable(j.tableName))
                    });
                }

                // Remember each of those columns we found
                tables
                    .filter(t => !!t)
                    .forEach(t => {
                        t.columns.forEach(c => {
                            toReturn.push({
                                query : this._query,
                                fullName : `${t.name}.${c.name}`,
                                shortName : c.name,
                                expr : val.expr
                            });
                        });
                })

            } else if (val.expr instanceof ColumnExpression) {
                // Column expressions add exactly a single column
                const colExpr = <ColumnExpression> val.expr;

                toReturn.push({
                    query : this._query,
                    fullName : colExpr.toSqlString(),
                    shortName : val.name ? val.name : colExpr.columnName,
                    expr : val.expr
                });
            } else {
                throw new Error ("Unknown colum type in result description");
            }
        });

        return (toReturn);
    }

    /**
     * @param i The index of the column as it's part of the SELECT
     *          statement. This means that StarExpressions are *not*
     *          expanded when retrieving the expression.
     *
     * @return The expression of the column with index i.
     */
    getColumn(i : number) : Expression {
        return this._columns[i].expr;
    }

    /**
     * @return The colum with the given name or alias.
     */
    getActualColumnByName(name : string) : ResultColumn {
        // First attempt: Using only the alias name
        let toReturn = this.actualColums.find(c => c.shortName == name);

        // Is a second attempt required?
        if (toReturn === undefined) {
            // Yes :(

            // Grab only columns that actually refer to a table-column
            type CertainlyColumn = {
                query : Query
                shortName : string
                fullName : string
                expr : ColumnExpression
            }
            const tableColumns = this.actualColums
                .filter(e => e.expr instanceof ColumnExpression) as CertainlyColumn[];

            // And check wheter such a table-column has a matching name
            toReturn = tableColumns.find(c => c.expr.columnName === name);
        }

        // Did the second attempt fail?
        if (toReturn === undefined) {
            const queryName = this.query ? this.query.name :  "--unknown--";
            
            // Yes :(
            throw new Error(`Could not find column with name "${name}" on query "${queryName}"`);
        }

        return (toReturn);
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
    toSqlString() : string {
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
            toReturn += " " + c.expr.toSqlString();

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

    getLeaves() : Expression[] {
        const nestedLeaves = this._columns.map( v => v.expr.getLeaves());

        // Flatten the result
        return ([].concat.apply([], nestedLeaves));
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
