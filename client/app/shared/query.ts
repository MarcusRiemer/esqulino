import {Table}                          from './table';

/**
 * Maps the JSON structure that is used to represent the data
 * over the wire or on disk.
 */
export module Model {

    /**
     * The logical leaf of every expression tree, ends recursion.
     */
    export interface SingleColumnExpression {
        column : string;
        table? : string;
        alias? : string;
    }

    /**
     * Combines two expressions with a binary operator.
     */
    export interface BinaryExpression {
        lhs : Expression;
        operator : string;
        rhs : Expression;
        simple : boolean;
    }

    /**
     * We use a single base type for all kinds of expression, as
     * this vastly simplifies the storage process. Each kind of
     * concrete expression is stored under a key. Only one of these
     * keys may be set at runtime.
     */
    export interface Expression {
        singleColumn? : SingleColumnExpression;
        binary? : BinaryExpression;
    }

    export interface Select {
        columns : SelectColumn[];
    }

    export interface SelectColumn {
        expr : Expression;
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
            using? : string,
            on? : Expression
        }
    }

    export interface Where {
        first : Expression;
    }

    /**
     * Outermost description of a query. This contains
     * the whole structure and some identifying properties.
     */
    export interface Query {
        select : Select;
        from : From;
        name? : string;
        id? : string;
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
            return new ColumnExpression(expr.singleColumn);
        } else if (expr.binary) {
            return new BinaryExpression(expr.binary);
        }
        throw `Unknown expression: ${JSON.stringify(expr)}`
    }

    /**
     * An expression that maps a single column without any
     * transformations that are taking place. Logically a leaf
     * of an Expression Tree
     */
    export class ColumnExpression extends Expression {
        private _tableName : string = null;
        private _tableAlias : string = null;

        private _columnName : string;

        constructor(model : Model.SingleColumnExpression) {
            super();
            this._columnName = model.column;
            this._tableName = model.table;
            this._tableAlias = model.alias;
        }

        /**
         * @return The name of the column
         */
        get columnName() {
            return (this._columnName);
        }

        /**
         * Retrieves the highest ranked name that should be used to
         * qualify the name of this column.
         */
        get tableQualifier() {
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
                return `${this.tableQualifier}.${this._columnName}`;
            } else {
                return (this._columnName);
            }

        }
    }

    /**
     * Combines two expressions into a single expression.
     */
    export class BinaryExpression extends Expression {
        private _lhs : Expression;
        private _rhs : Expression;

        private _operator : string;
        private _isSimple : boolean;

        public constructor(expr : Model.BinaryExpression) {
            super();

            this._lhs = loadExpression(expr.lhs);
            this._rhs = loadExpression(expr.rhs);
            this._isSimple = expr.simple;
            this._operator = expr.operator;
        }

        /**
         * @return The string representation of both operands with
         *         the operator in between.
         */
        public toString() : string {
            return (`${this._lhs} ${this._operator} ${this._rhs}`)
        }

        /**
         * @return The used operator
         */
        public get operator() {
            return (this._operator);
        }

        /**
         * @return The left operand
         */
        public get lhs() {
            return (this._lhs);
        }

        /**
         * @return The right operand
         */
        public get rhs() {
            return (this._rhs);
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
                var toAdd : NamedExpression = {
                    name : v.as,
                    expr : loadExpression(v.expr)
                };

                this._columns.push(toAdd);
            });
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
        protected _sqlJoinKeyword : string;
        protected _tableName : string;
        protected _tableAlias : string;

        constructor(sqlJoinKeyword : string, tableName : string, tableAlias? : string) {
            this._sqlJoinKeyword = sqlJoinKeyword;
            this._tableName = tableName;
            this._tableAlias = tableAlias;
        }

        /**
         * @return The name of the table that is JOINed
         */
        get name() {
            return (this._tableName);
        }

        /**
         * @return the alias name of the JOINed table
         */
        get alias() {
            return (this._tableAlias);
        }

        /**
         * This is not exactly nice, but the frontend templating engine
         * needs to display something.
         *
         * @return The used JOIN Method
         */
        get sqlJoinKeyword() {
            return (this._sqlJoinKeyword);
        }

        /**
         * @return The name of this table with it's alias, if there is an
         * alias given.
         */
        get nameWithAlias() {
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
            // No SQL Keyword for the first statement
            super(null, name, alias);
        }

        toString() : string {
            return this.nameWithAlias;
        }
    }

    /**
     * Represents a cross join, no matter whether its using a
     * comma or the JOIN keyword.
     */
    export class CrossJoin extends Join {
        constructor(join : Model.Join) {
            var separator : string;
            switch(join.cross) {
            case "comma":
                separator = ",";
                break;
            case "cross":
                separator = "JOIN"
                break;
            default:
                throw `Unknown type in cross join: ${join.cross}`;
            }

            super(separator, join.table, join.alias);
        }

        toString() : string {
            // There is no way around the separator and the name of
            // the table.
            return (`${this._sqlJoinKeyword} ${this.nameWithAlias}`);
        }
    }

    /**
     * All types of INNER JOINs.
     */
    export class InnerJoin extends Join {
        private _using : string;
        private _on : Expression;

        constructor(join : Model.Join) {
            super("INNER JOIN", join.table, join.alias);

            // Ensure USING XOR ON
            if ((join.inner.on && join.inner.using) ||
                (!join.inner.on && !join.inner.using)) {
                throw { msg : "USING ^ ON check failed" };
            }

            // Load expression would throw on a null value, so
            // we need to wrap this.
            if (join.inner.on) {
                this._on = SyntaxTree.loadExpression(join.inner.on);
            }
            
            this._using = join.inner.using;
        }

        toString() : string {
            let method = (this._using) ? "USING" : "ON";
            let expr = (this._using) ? this._using : this._on.toString();
            
            return (`${this._sqlJoinKeyword} ${this.nameWithAlias} ${method}(${expr})`);
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

        /**
         * @return The table that starts the JOIN-chain.
         */
        get initial() : InitialJoin {
            return (this._first);
        }

        /**
         * @return The number of joins in the chain
         */
        get numberOfJoins() : number {
            return (this._joins.length);
        }

        get joins() : Join[] {
            return (this._joins);
        }

        /**
         * @param n Starting at 0
         * @return The n-th join of this FROM clause
         */
        getJoin(n : number) : Join {
            return (this._joins[n]);
        }

        /**
         * @return The SQL-string-representation of this clause
         */
        toString() : string {
            let toReturn = `FROM ${this._first.nameWithAlias}`;

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
    private model : Model.Query;

    private _name : string;
    private _id   : string;

    private _select : SyntaxTree.Select;
    private _from   : SyntaxTree.From;

    constructor(schema : Table[], model : Model.Query) {
        this._name = model.name;
        this._id = model.id;

        this.schema = schema;
        this.model = model;

        this._select = new SyntaxTree.Select(model.select);
        this._from = new SyntaxTree.From(model.from);
    }

    /**
     * @return The FROM component of this query, guaranteed to be present.
     */
    get select() {
        return (this._select);
    }

    /**
     * @return The FROM component of this query, guaranteed to be present.
     */
    get from() {
        return (this._from);
    }

    /**
     * @return A "meaningful" name for the query.
     */
    get name() {
        return (this._name);
    }

    /**
     * @return A "meaningful" name for the query.
     */
    get id() {
        return (this._id);
    }


    /**
     * Calculates the SQL String representation of this query.
     */
    public toSqlString() : string {
        var toReturn = this._select.toString();
        toReturn += "\n" + this._from.toString();

        return (toReturn);
    }

    public toModel() : Model.Query {
        return (null);
    }
}
