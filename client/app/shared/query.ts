import {Table}                          from './table';

/**
 * Maps the JSON structure that is used to represent the data
 * over the wire or on disk.
 */
export module Model {
    /**
     * Valid string values for data types
     */
    export type DataTypeStrings = "INTEGER" | "REAL" | "TEXT";
    
    /**
     * One "typical" logical leaf of an expression tree, postpones
     * the actual value lookup to execution time and ends recursion.
     */
    export interface SingleColumnExpression {
        column : string
        table? : string
        alias? : string
    }

    /**
     * The other "typical" leaf, a compile time expression that also
     * ends recursion.
     */
    export interface ConstantExpression {
        type : DataTypeStrings
        value : string
    }

    /**
     * Combines two expressions with a binary operator.
     */
    export interface BinaryExpression {
        lhs : Expression
        operator : string
        rhs : Expression
        simple : boolean
    }

    /**
     * Denotes an expression that is intentionally missing.
     */
    export interface MissingExpression {

    }

    /**
     * We use a single base type for all kinds of expression, as
     * this vastly simplifies the storage process. Each kind of
     * concrete expression is stored under a key. Only one of these
     * keys may be set at runtime.
     */
    export interface Expression {
        singleColumn? : SingleColumnExpression
        binary? : BinaryExpression
        constant? : ConstantExpression
        missing? : MissingExpression
    }

    export interface Select {
        columns : SelectColumn[],
        allData? : boolean
    }

    export interface SelectColumn {
        expr : Expression,
        as? : string
    }

    /**
     * Named tables as described in the FROM
     */
    export interface TableNameDefinition {
        name : string,
        alias? : string
    }

    export interface From {
        first : TableNameDefinition,
        joins? : Join[]
    }

    export interface Join {
        table : TableNameDefinition,
        cross? : string,
        inner? : {
            using? : string,
            on? : Expression
        }
    }

    export interface Where {
        first : Expression
    }

    /**
     * Outermost description of a query. This contains
     * the whole structure and some identifying properties.
     */
    export interface Query {
        select : Select,
        from : From,
        where? : Where,
        name : string,
        id : string
    }
}

/**
 * The internal representation of an SQL query.
 */
export module SyntaxTree {

    /**
     * Basic data types as inspired by SQLite.
     */
    export enum DataType {
        Integer,
        Real,
        Text
    }

    /**
     * Translates "over the wire" representations of a datatype
     * to an enum.
     */
    export function parseDataType(str : string) : DataType {
        switch (str) {
        case "INTEGER": return (DataType.Integer);
        case "REAL"   : return (DataType.Real);
        case "TEXT"   : return (DataType.Text);
        }

        throw { "error" : `parseDataType: Unknown datatype "${str}` };
    }

    /**
     * Translates enum representation of data type to "over the wire"
     * representation.
     */
    export function serializeDataType(t : DataType) : Model.DataTypeStrings {
        switch(t) {
        case DataType.Integer: return "INTEGER";
        case DataType.Real   : return "REAL";
        case DataType.Text   : return "TEXT";
        }

        throw { "error" : `serializeDataType: Unknown datatype "${t}` };
    }

    /**
     * Something that is able to host an expression.
     */
    interface ExpressionParent {
        /**
         * Replaces a child of this expression. This is used by
         * outside components, which need a way to change the structure
         * of a query whilst leaving the "root pointer" intact.
         *
         * @param formerChild The instance that previously was a child
         * @param newChild    The instance that should take the place
         */
        replaceChild(formerChild : Expression, newChild : Expression) : void;
    }
    
    /**
     * Base class for all components of an SQL Statement (SELECT,
     * FROM, WHERE, GROUP BY, HAVING, ORDER BY). Additionally, this
     * models top level AND and OR conjunctions as top level components,
     * because this eases development for beginners.
     */
    abstract class Component {
        /**
         * @return SQL String representation
         */
        public abstract toString() : string;

        /**
         * @return JSON model representation
         */
        public abstract toModel() : any;
    }

    /**
     * Valid template identifiers. Sadly a leaky abstraction that needs
     * to be kept in sync with the templates.
     */
    type TemplateId = "constant" | "column" | "binary" | "missing";

    /**
     * Base class for all expressions, no matter how many arguments they
     * require or what the return type is.
     */
    export abstract class Expression implements ExpressionParent {

        private _parent : ExpressionParent;
        
        /**
         * @param _templateidentifier The type of template needed to render
         *                            this expression.
         */
        constructor(private _templateIdentifier : TemplateId,
                    parent : ExpressionParent) {
            this._parent = parent;
        }

        /**
         * Replaces this expression with the given expression in it's
         * parent.
         *
         * @return The new child
         */
        replaceSelf(newChildDesc : Model.Expression) : Expression {
            const newChild = loadExpression(newChildDesc, this._parent);
            this._parent.replaceChild(this, newChild);

            return (newChild);
        }

        abstract replaceChild(formerChild : Expression, newChild : Expression) : void;

        /**
         * Because the user can construct new Queries with "holes", not every
         * query can be represented as SQL string.
         *
         * @return true, if this expression could be turned into an SQL string.
         */
        abstract isComplete() : boolean;
        
        /**
         * @return SQL String representation
         */
        abstract toString() : string;

        /**
         * @return JSON model representation
         */
        abstract toModel() : any;

        /**
         * This is a more or less leaky abstraction, but the HTML rendering
         * template needs to know which kind of expression it is dealing
         * with. Ideally this model wouldn't need to do anything frontend-
         * related.
         *
         * @return The template identifier to use
         */
        get templateIdentifier() : TemplateId {
            return (this._templateIdentifier);
        }
    }

    /**
     * Maps the "one size fits all"-interface for expressions
     * to their concrete classes. Essentially a factory-function.
     */
    export function loadExpression(expr : Model.Expression,
                                   parent : ExpressionParent) : Expression {
        if (expr.singleColumn) {
            return new ColumnExpression(expr.singleColumn, parent);
        } else if (expr.binary) {
            return new BinaryExpression(expr.binary, parent);
        } else if (expr.constant) {
            return new ConstantExpression(expr.constant, parent);
        } else if (expr.missing) {
            return new MissingExpression(expr.missing, parent);
        }
        throw { "error" : `Unknown expression: ${JSON.stringify(expr)}` }
    }

    /**
     * Denotes an intentionally missing value in an expression. These values
     * are meant to be replaced by the user and block serialization.
     */
    export class MissingExpression extends Expression {

        constructor(_expr : Model.MissingExpression,
                    parent : ExpressionParent) {
            super("missing", parent);
        }

        /**
         * A missing expression is never complete.
         *
         * @return false
         */
        isComplete() : boolean {
            return (false);
        }

        /**
         * Will throw an exception, as missing expressions can't be
         * converted to strings.
         */
        toString() : string {
            throw {
                err : "Statement contains missing expression"
            }
        }

        /**
         * The missing expression can never have children.
         */
        replaceChild(formerChild : Expression, newChild : Expression) {
            throw {
                err : "The missing statement should never have children"
            }
        }

        toModel() : Model.Expression {
            return ({
                missing : {
                }
            })
        }
    }

    /**
     * A compile time constant, logically a leaf of an Expression
     * Tree.
     */
    export class ConstantExpression extends Expression {
        private _type : DataType;
        private _value : string;
        
        constructor(expr : Model.ConstantExpression,
                    parent : ExpressionParent) {
            super("constant", parent);

            this._type = parseDataType(expr.type);
            this._value = expr.value;
        }

        isComplete() : boolean {
            return (true);
        }

        get type() : DataType {
            return (this._type);
        }

        get value() : string {
            return (this._value);
        }

        set value(val) {
            this._value = val;
        }

        toString() : string {
            switch(this._type) {
            case DataType.Integer:
            case DataType.Real:
                return (this._value);
            case DataType.Text:
                return (`"${this._value}"`);
            }
        }

        toModel() : Model.Expression {
            return ({
                constant : {
                    type : serializeDataType(this._type),
                    value : this._value
                }
            })
        }

        replaceChild(formerChild : Expression, newChild : Expression) {
            throw {
                err : "The constant expression should never have children"
            }
        }
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

        constructor(model : Model.SingleColumnExpression,
                    parent : ExpressionParent) {
            super("column", parent);
            this._columnName = model.column;
            this._tableName = model.table;
            this._tableAlias = model.alias;
        }

        isComplete() : boolean {
            return (true);
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

        toModel() : Model.Expression {
            let core : Model.SingleColumnExpression = {
                column : this._columnName
            };

            if (this._tableName)  core.table = this._tableName;
            if (this._tableAlias) core.alias = this._tableAlias;

            return ({
                singleColumn : core
            });
        }

        replaceChild(formerChild : Expression, newChild : Expression) {
            throw {
                err : "The column expression should never have children"
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

        constructor(expr : Model.BinaryExpression,
                    parent : ExpressionParent) {
            super("binary", parent);

            this._lhs = loadExpression(expr.lhs, this);
            this._rhs = loadExpression(expr.rhs, this);
            this._isSimple = expr.simple;
            this._operator = expr.operator;
        }

        isComplete() : boolean {
            return (this._lhs.isComplete() && this._rhs.isComplete())
        }

        /**
         * @return The string representation of both operands with
         *         the operator in between.
         */
        toString() : string {
            return (`${this._lhs} ${this._operator} ${this._rhs}`)
        }

        /**
         * @return The used operator
         */
        get operator() {
            return (this._operator);
        }

        /**
         * @return The left operand
         */
        get lhs() {
            return (this._lhs);
        }

        /**
         * @return The right operand
         */
        get rhs() {
            return (this._rhs);
        }

        toModel() : Model.Expression {
            return ({
                binary :{
                    lhs : this._lhs.toModel(),
                    rhs : this._rhs.toModel(),
                    operator : this._operator,
                    simple : this._isSimple
                }
            })
        }

        replaceChild(formerChild : Expression, newChild : Expression) {
            if (this._lhs == formerChild) {
                this._lhs = newChild;
            } else if (this._rhs == formerChild) {
                this._rhs = newChild;
            } else {
                //throw  "Given child is not a direct child";
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

            // Possibly add a trailing "*" Operator
            if (this._allData) {
                if (this.columns.length > 0) {
                    toReturn += ", *";
                } else {
                    toReturn += " *";
                }
            }

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
    }

    /**
     * Base class for all joins.
     *
     * @todo This ignores the possibility of sub-SELECTs in the FROM
     *       clause.
     */
    abstract class Join {
        protected _sqlJoinKeyword : string;

        protected _table : Model.TableNameDefinition;

        /**
         * Stores base data
         */
        constructor(sqlJoinKeyword : string, table : Model.TableNameDefinition) {
            this._sqlJoinKeyword = sqlJoinKeyword;
            this._table = table;
        }

        /**
         * @return The name of the table that is JOINed
         */
        get name() {
            return (this._table.name);
        }

        /**
         * @return the alias name of the JOINed table
         */
        get alias() {
            return (this._table.alias);
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
            let toReturn = this._table.name;

            // But the alias is optional
            if (this._table.alias) {
                toReturn += ` ${this._table.alias}`;
            }

            return (toReturn);
        }

        /**
         * @return A string representing a join with a single table
         */
        abstract toString() : string;

        abstract toModel() : Model.Join;
    }

    /**
     * Although there is not really a SQL keyword for this,
     * the first table in the FROM component needs to be
     * treated seperatly.
     */
    export class InitialJoin extends Join {

        constructor(table : Model.TableNameDefinition) {
            // No SQL Keyword for the first statement
            super(null, table);
        }

        toString() : string {
            return this.nameWithAlias;
        }

        toModel() : Model.Join {
            return ({
                table : this._table
            });
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

            super(separator, join.table);
        }

        toString() : string {
            // There is no way around the separator and the name of
            // the table.
            return (`${this._sqlJoinKeyword} ${this.nameWithAlias}`);
        }

        toModel() : Model.Join {
            const crossType = this._sqlJoinKeyword == ',' ? "comma" : "cross";
            
            return ({
                table : this._table,
                cross : crossType
            });
        }
    }

    /**
     * All types of INNER JOINs.
     */
    export class InnerJoin extends Join implements ExpressionParent {
        private _using : string;
        private _on : Expression;

        constructor(join : Model.Join) {
            super("INNER JOIN", join.table);

            // Ensure USING XOR ON
            if ((join.inner.on && join.inner.using) ||
                (!join.inner.on && !join.inner.using)) {
                throw { msg : "USING ^ ON check failed" };
            }

            // Load expression would throw on a null value, so
            // we need to wrap this.
            if (join.inner.on) {
                this._on = SyntaxTree.loadExpression(join.inner.on, this);
            }

            this._using = join.inner.using;
        }

        toString() : string {
            let method = (this._using) ? "USING" : "ON";
            let expr = (this._using) ? this._using : this._on.toString();

            return (`${this._sqlJoinKeyword} ${this.nameWithAlias} ${method}(${expr})`);
        }

        toModel() : Model.Join {
            let toReturn : Model.Join = {
                table : this._table
            };

            if (this._on) {
                toReturn.inner = {
                    on : this._on.toModel()
                }
            }

            if (this._using) {
                toReturn.inner = {
                    using : this._using
                }
            }
            
            return (toReturn);
        }

        replaceChild(formerChild : Expression, newChild : Expression) {
            if (this._on == formerChild) {
                this._on = newChild;
            } else {
                throw { err : "Not implemented" }
            }
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

            this._first = new InitialJoin(from.first);

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
            } else {
                // There should at least be a list
                this._joins = [];
            }
        }

        /**
         * @return The table that starts the JOIN-chain.
         */
        get first() : InitialJoin {
            return (this._first);
        }

        /**
         * @return The number of joins in the chain
         */
        get numberOfJoins() : number {
            return (this._joins.length);
        }

        /**
         * @return Accessing all joins together
         */
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

        toModel() : Model.From {
            let toReturn : Model.From = {
                first : this._first.toModel().table,
            };

            if (this._joins.length > 0) {
                toReturn.joins = this._joins.map( j => j.toModel());
            }
            
            return (toReturn);
        }
    }

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
}

/**
 * Facade for a query that allows meaningful mapping to the UI.
 */
export class Query {
    public schema : Table[];
    private model : Model.Query;

    private _isDirty = false;

    private _name : string;
    private _id   : string;

    private _select : SyntaxTree.Select;
    private _from   : SyntaxTree.From;
    private _where  : SyntaxTree.Where;

    constructor(schema : Table[], model : Model.Query) {
        this._name = model.name;
        this._id = model.id;

        this.schema = schema;
        this.model = model;

        this._select = new SyntaxTree.Select(model.select);
        this._from = new SyntaxTree.From(model.from);

        if (model.where) {
            this._where = new SyntaxTree.Where(model.where);
        }
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
     * @return The WHERE component of this query, may or may not be present,
     *         depending on the underlying model.
     */
    get where() {
        return (this._where);
    }

    /**
     * @return True, if this instance requires a save.
     */
    get isDirty() {
        return (this._isDirty);
    }


    /**
     * @return A "meaningful" name for the query.
     */
    get name() {
        return (this._name);
    }

    /**
     * @param value The new "meaningful" name for this query
     */
    set name(value : string) {
        this._isDirty = true;
        this._name = value;
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

        if (this._where) {
            toReturn += "\n" + this._where.toString();
        }

        return (toReturn);
    }

    /**
     * Serializes the whole query to the "over-the-wire" format.
     * @return The "over-the-wire" JSON representation
     */
    public toModel() : Model.Query {
        let toReturn : Model.Query = {
            name : this._name,
            id : this._id,
            from : this._from.toModel(),
            select : this._select.toModel()
        };

        if (this._where) {
            toReturn.where = this._where.toModel();
        }
        
        return (toReturn);
    }
}
