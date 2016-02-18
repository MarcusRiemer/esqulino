import {Table}                          from './table';

/**
 * Maps the JSON structure that is used to represent the data
 * over the wire or on disk.
 */
export module Model {

    export interface Expression {
        singleColumn? : string;
    }
    
    export interface Select {
        columns : SelectColumn[];
    }

    export interface SelectColumn {
        single? : {
            column : string;
            table? : string;
            alias? : string;
        }
        as? : string;
    }
    
    export interface From {
        table : string;
        alias? : string;
        joins? : Join[];
    }

    export interface Join {
        table : string,
        alias? : string,
        cross? : string,
        inner? : {
            method : string,
            expr : Expression
        }
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
    export abstract class Expression {
        public abstract toString() : string;
    }

    /**
     * Maps the "one size fits all"-interface for expressions
     * to their concrete classes.
     */
    export function loadExpression(expr : Model.Expression) : Expression {
        if (expr.singleColumn) {
            return new ColumnExpression({ single : { column : expr.singleColumn } });
        }
        throw "Unknown expression: ${expr}"
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
            this._columnName = model.single.column;
            this._tableName = model.single.table;
            this._tableAlias = model.single.alias;
        }

        /**
         * @return The name of the column
         */
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
                return "";
            }
        }

        /**
         * @return True, if any qualifier is set.
         */
        get hasTableQualifier() : boolean {
            return (!!this._tableAlias || !!this._tableName);
        }

        /**
         * @return The fully qualified column name
         */
        toString() : string {
            if (this.hasTableQualifier) {
                return `${this.TableQualifier}.${this._columnName}`;
            } else {
                return (this._columnName);
            }
            
        }
    }

    /**
     * Allows an expression to be named, typically in "SELECT <expr> AS <name>" 
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
                
                if (v.single) {
                    toAdd = {
                        name : v.as,
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

        /**
         * @return The column with index i
         */
        getColumn(i : number) {
            return this._columns[i].expr;
        }

        /**
         * @return "SELECT [columns]"
         */
        toString() : string {
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
    }

    /**
     * Base class for all joins.
     *
     * @todo This ignores the possibility of sub-SELECTs in the FROM
     *       clause.
     */
    abstract class Join {
        
        protected _tableName : string;
        protected _tableAlias : string;

        constructor(tableName : string, tableAlias? : string) {
            this._tableName = tableName;
            this._tableAlias = tableAlias;
        }


        /**
         * @return The name of the table that is JOINed
         */
        get Name() {
            return (this._tableName);
        }

        /**
         * @return the alias name of the JOINed table
         */
        get Alias() {
            return (this._tableAlias);
        }
        
        /**
         * @return The name of this table with it's alias, if there is an
         * alias given.
         */
        get NameWithAlias() {
            let toReturn = this._tableName;

            // But the alias is optional
            if (this._tableAlias) {
                toReturn += ` ${this._tableAlias}`;
            }

            return (toReturn);
        }
        
        
        /**
         * @return A string representing a join with a single table
         */
        abstract toString() : string;
    }

    /**
     * Although there is not really a SQL keyword for this,
     * the first table in the FROM component needs to be
     * treated seperatly.
     */
    export class InitialJoin extends Join {

        constructor(name : string, alias? : string) {
            super(name, alias);
        }
        
        toString() : string {
            return this.NameWithAlias;
        }
    }

    /**
     * Represents a cross join, no matter whether its using a
     * comma or the JOIN keyword.
     */
    export class CrossJoin extends Join {
        private _separator = ",";

        constructor(join : Model.Join) {
            super(join.table, join.alias);

            switch(join.cross) {
            case "comma":
                this._separator = ",";
                break;
            case "cross":
                this._separator = "JOIN"
                break;
            default:
                throw `Unknown type in cross join: ${join.cross}`;
            }
        }

        toString() : string {
            // There is no way around the separator and the name of
            // the table.
            return (`${this._separator} ${this.NameWithAlias}`);
        }
    }

    /**
     * All types of INNER JOINs.
     */
    export class InnerJoin extends Join {
        private _method : string;
        private _expr : Expression;

        constructor(join : Model.Join) {
            super(join.table, join.alias);

            this._expr = SyntaxTree.loadExpression(join.inner.expr);
            this._method = join.inner.method;
        }
        
        toString() : string {
            return (`INNER JOIN ${this.NameWithAlias} ${this._method.toUpperCase()}(${this._expr.toString()})`);
        }
    }

    /**
     * The SQL FROM clause with 0..n subsequent JOINs.
     */
    export class From extends Component {
        private _first : InitialJoin;
        private _joins : Join[] = [];

        constructor(from : Model.From) {
            super();

            this._first = new InitialJoin(from.table, from.alias);

            if (from.joins) {
                from.joins.forEach(j => {
                    if(j.cross) {
                        this._joins.push(new CrossJoin(j));
                    } else if (j.inner) {
                        this._joins.push(new InnerJoin(j));
                    } else {
                        throw `Unknown JOIN type: ${j.cross}`;

                    }
                });
            }
        }

        get Initial() : InitialJoin {
            return (this._first);
        }
        
        /**
         * @param n Starting at 0
         * @return The n-th join of this FROM clause
         */
        getJoin(n : number) : Join {
            return (this._joins[n]);
        }
        
        toString() : string {
            let toReturn = `FROM ${this._first.NameWithAlias}`;

            this._joins.forEach(j => {
                toReturn += "\n\t" + j.toString();
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

    /**
     * @return The select component of this query, guaranteed to be present.
     */
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
