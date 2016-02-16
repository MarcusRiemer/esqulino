import {Table}                          from './table';

/**
 * Maps the JSON structure that is used to represent the data
 * over the wire or on disk.
 */
export module Model {

    export interface Expression {
        type : string;
    }
    
    export interface Select {
        columns : SelectColumn[];
    }

    export interface SelectColumn {
        simple? : {
            column : string;
            asName : string;
        }
    }
    
    export interface From {
        table : string;
        alias : string;
        joins? : Join[];
    }

    export interface Join {
        table : string,
        alias : string,
        type : string
    }

    export interface Query {
        select : Select;
        from : From;   
    }
}

/**
 * The internal representation of an SQL query.
 */
export module SyntaxTree {
    /**
     * Base class for all components of an SQL Statement (SELECT,
     * FROM, WHERE, GROUP BY, HAVING, ORDER BY). Additionally, this
     * models top level AND and OR conjunctions as top level components,
     * because this eases development for beginners.
     */
    abstract class Component {
        /**
         * 
         */
        public abstract toString() : string;
    }

    /**
     * Base class for all expressions, no matter how many arguments they
     * require or what the return type is.
     */
    abstract class Expression {
        public abstract toString() : string;
    }

    /**
     * An expression that maps a single column without any
     * transformations that are taking place.
     */
    export class ColumnExpression extends Expression {
        private _tableName : string = null;
        private _tableAlias : string = null;

        private _columnName : string;

        constructor(model : Model.SelectColumn) {
            super();
            this._columnName = model.simple.column;
        }

        get ColumnName() {
            return (this._columnName);
        }

        /**
         * Retrieves the highest ranked name that should be used to
         * qualify the name of this column.
         */  
        get TableQualifier() {
            if (this._tableAlias) {
                // Table alias has the highest weight to be returned
                return (this._tableAlias);
            } else if (this._tableName) {
                // Table names are the fallback
                return (this._tableName);
            } else {
                // Each column *must* have an associated table for now
                throw "No known alias name";
            }
        }

        toString() : string {
            return `${this.TableQualifier}.${this._columnName}`;
        }
    }

    /**
     * Allows an expression to be named, typically in SELECT expr AS name 
     * contexts.
     */
    interface NamedExpression {
        name? : string;
        expr : Expression;
    }

    /**
     * A select statement
     */
    export class Select extends Component {
        private _columns : NamedExpression[] = [];

        constructor(select : Model.Select) {
            super();
            // Mapping the model types to concrete instances of the
            // syntax tree.
            select.columns.forEach(v => {
                var toAdd : NamedExpression;
                
                if (v.simple) {
                    toAdd = {
                        name : v.simple.asName,
                        expr : new ColumnExpression(v)
                    };
                }

                if (toAdd === null) {
                    throw "Unknown column expression";
                }

                this._columns.push(toAdd);
            });
        }

        /**
         * @return The number of columns this select statement retrieves
         */
        get NumberOfColumns() {
            return (this._columns.length);
        }

        getColumn(i : number) {
            return this._columns[i].expr;
        }

        toString() : string {
            // We start of with the normal keyword
            var toReturn = "SELECT";

            // And add all those columns
            this._columns.forEach(c => {
                // Every column is separated by a single space
                toReturn += " " + c.expr.toString();

                // Optionally, there may be an alias name for the column
                if (c.name) {
                    toReturn += ` AS ${c.name}`;
                }
            });

            return (toReturn);
        }
    }
}

/**
 * Facade for a query that allows meaningful mapping to the UI.
 */
export class Query {
    public schema : Table[];
    public model : Model.Query;

    private _select : SyntaxTree.Select;
    
    constructor(schema : Table[], model : Model.Query) {
        this.schema = schema;
        this.model = model;

        this._select = new SyntaxTree.Select(model.select);
    }

    get Select() {
        return (this._select);
    }

    /**
     * Calculates the SQL String representation of this query.
     */
    public toSqlString() : string {
        var toReturn = this._select.toString();

        return (toReturn);
        
    }

    public toModel() : Model.Query {
        return (null);
    }
}
