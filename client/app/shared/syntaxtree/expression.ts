import {
    ExpressionParent, Removable
} from './common'

import {
    Model, ValidationResult, Validateable
} from '../query'

import {
    ValidationErrors
} from '../query.validation'

import {
    Schema
} from '../schema'

/**
 * Valid template identifiers. Sadly a leaky abstraction that needs
 * to be kept in sync with the templates. Every time a new type of
 * expression is added, a template identifier needs to be added here
 * and a reaction is required in the expression HTML template file.
 */
export type TemplateId = "constant" | "column" | "parameter" | "binary" | "missing" | "star";

/**
 * Calculates the SQL type of the given string.
 */
export function determineType(constant : string) : Model.DataType {
    if (/^-?\d+$/.test(constant)) {
        return "INTEGER";
    } else if (/^-?(\d+\.?\d*)$|(\d*\.?\d+)$/.test(constant)) {
        return "REAL";
    } else {
        return "TEXT";
    }
}

/**
 * Base class for all expressions, no matter how many arguments they
 * require or what the return type is.
 */
export abstract class Expression implements ExpressionParent, Removable, Validateable {

    /**
     * The host of this expression. May be another expression or a
     * a top level component like SELECT
     */
    private _parent : ExpressionParent;

    /**
     * @param _templateidentifier The type of template needed to render
     *                            this expression.
     * @param parent the parent of this expression.
     */
    constructor(private _templateIdentifier : TemplateId,
                parent : ExpressionParent) {
        this._parent = parent;
    }

    /**
     * @return The parent of this expression. May be another expression or a
     * a top level component like SELECT.
     */
    get parent() : ExpressionParent {
        return (this._parent);
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

    /**
     * Replaces the current place this expression is stored with an unknown
     * expression.
     */
    removeSelf() {
        console.log(`Expression.removeSelf()`);
        this._parent.removeChild(this);
    }

    /**
     * Expressions need to decide themselves on how to replace their children.
     */
    abstract replaceChild(formerChild : Expression, newChild : Expression) : void;

    /**
     * Replaces the given place in this expression with an unknown
     * expression.
     */
    removeChild(formerChild : Expression) {
        console.log(`Expression.removeChild()`);
        const missing = new MissingExpression({}, this);
        this.replaceChild(formerChild, missing);
    }

    /**
     * Because the user can construct new Queries with "holes", not every
     * query can be represented as SQL string. On top of that, the schema
     * could change behind the back of the application, which could mean
     * that certain tables or columns are not available anymore.
     *
     * @return true, if this expression could be turned into an SQL string.
     */
    abstract validate(schema : Schema) : ValidationResult;

    /**
     * If the expression itself is valid it can be represented as an SQL
     * string. 
     *
     * @return SQL String representation
     */
    abstract toSqlString() : string;

    /**
     * Every expression can be serialized at any time, no matter how incomplete
     * or wrong the current state is.
     *
     * @return JSON model representation
     */
    abstract toModel() : any;

    /**
     * Retrieves all leaves of this expression tree.
     */
    abstract getLeaves() : Expression[];

    /**
     * Most expressions won't be helpful when trying to track down their
     * exact locations. So the default implementation is simply "ask the
     * parent".
     */
    getLocationDescription() : string {
        return (this._parent.getLocationDescription());
    }

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
 * Denotes an intentionally missing value in an expression. These values
 * are meant to be replaced by the user and block serialization.
 */
export class MissingExpression extends Expression {

    constructor(_expr : Model.MissingExpression,
                parent : ExpressionParent) {
        super("missing", parent);
    }

    /**
     * A missing expression is always invalid.
     */
    validate(schema : Schema) : ValidationResult {
        return (new ValidationResult([new ValidationErrors.MissingExpression(this)]));
    }

    /**
     * Will throw an exception, as missing expressions can't be
     * converted to strings.
     *
     * @TODO: Throwing here may not be smart, as the Angular 2 change detector
     *        seems to call this sometimes.
     */
    toSqlString() : string {
        throw new Error("Statement contains missing expression");
        //return ("##Missing##");
    }

    /**
     * The missing expression can never have children.
     */
    replaceChild(formerChild : Expression, newChild : Expression) {
        throw new Error("The missing statement should never have children");
    }

    toModel() : Model.Expression {
        return ({
            missing : {
            }
        })
    }

    getLeaves() : Expression[] {
        return [this];
    }
}

/**
 * A compile time constant, logically a leaf of an Expression
 * Tree.
 */
export class ConstantExpression extends Expression {
    private _type : Model.DataType;
    private _value : string;

    constructor(expr : Model.ConstantExpression,
                parent : ExpressionParent) {
        super("constant", parent);

        this._type = expr.type;
        this._value = expr.value;
    }

    /**
     * A constant expression always has a value.
     */
    validate(schema : Schema) : ValidationResult {
        return (ValidationResult.VALID);
    }

    get type() : Model.DataType {
        return (this._type);
    }

    get value() : string {
        return (this._value);
    }

    set value(val) {
        this._value = val;
    }

    replaceChild(formerChild : Expression, newChild : Expression) {
        throw new Error("The constant expression should never have children")
    }

    toSqlString() : string {
        switch(this._type) {
        case <Model.DataType>"INTEGER":
        case <Model.DataType>"REAL":
            return (this._value);
        case <Model.DataType>"TEXT":
            return (`"${this._value}"`);
        }
    }

    toModel() : Model.Expression {
        return ({
            constant : {
                type : this._type,
                value : this._value
            }
        })
    }

    getLeaves() : Expression[] {
        return [this];
    }
}

/**
 * A compile time constant, logically a leaf of an Expression
 * Tree.
 */
export class ParameterExpression extends Expression {
    private _key : string;

    constructor(expr : Model.ParameterExpression,
                parent : ExpressionParent) {
        super("parameter", parent);

        // We assign this to the property, as this ensures the
        // value is actually a valid key.
        this.key = expr.key;
    }

    /**
     * Technically, this can't be asessed during compile time, so
     * we assume that the value will actually be filled in.
     */
    validate(schema : Schema) : ValidationResult {
        return (ValidationResult.VALID);
    }

    /**
     * @return The key this parameter uses
     */
    get key() : string {
        return (this._key);
    }

    /**
     * Ensures the key begins with a letter followed by only
     * alpha-numeric characters or an underscore.
     * 
     * @param val The key this parameter uses
     */
    set key(val) {
        if (!/^[a-zA-Z]+[a-zA-Z0-9_]*$/.test(val)) {
            throw new Error(`Invalid parameter key: ${val}`);
        }

        this._key = val;
    }

    replaceChild(formerChild : Expression, newChild : Expression) {
        throw new Error("The parameter expression should never have children");
    }

    /**
     * @return The key of this parameter in SQLites '@' notation
     */
    toSqlString() : string {
        return (`:${this._key}`);
    }

    toModel() : Model.Expression {
        return ({
            parameter : {
                key : this._key
            }
        })
    }

    getLeaves() : Expression[] {
        return [this];
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

    /**
     * @return True, if the column this expression references does exist.
     */
    validate(schema : Schema) : ValidationResult {
        // Does the table exist?
        if (!schema.hasTable(this._tableName)) {
            return (new ValidationResult([
                new ValidationErrors.UnknownTable(this)
            ]));
        }

        // Does the column exist?
        if (!schema.hasColumn(this._tableName, this._columnName)) {
            return (new ValidationResult([
                new ValidationErrors.UnknownColumn(this)
            ]));
        }

        // Everything exists
        return (ValidationResult.VALID);
    }

    /**
     * @return The name of the column
     */
    get columnName() {
        return (this._columnName);
    }

    /**
     * @return The name of the table
     */
    get tableName() {
        return (this._tableName);
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
    toSqlString() : string {
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
        throw new Error("The column expression should never have children");
    }

    getLeaves() : Expression[] {
        return [this];
    }
}

/**
 * Represents the SQL "*" Operator that is most commonly used in
 * the SELECT component. This expression can be limited to a certain
 * table, but expands over all tables if it is not limited.
 */
export class StarExpression extends Expression {
    // The table definition this expression is limited to
    private _limitedTo : Model.TableNameDefinition;

    constructor(model : Model.StarExpression,
                parent : ExpressionParent) {
        super("star", parent);

        this._limitedTo = model.limitedTo;
    }

    /**
     * @return The schema name of the table that this expression is
     *         limited to.
     */
    get tableName() {
        return (this._limitedTo.name);
    }

    /**
     * @return True, if this expression is somehow limited.
     */
    get isLimited() {
        return (!!this._limitedTo);
    }

    toSqlString() {
        if (this._limitedTo) {
            const qualifier = (this._limitedTo.alias) ? this._limitedTo.alias : this._limitedTo.name;
            return (`${qualifier}.*`);
        } else {
            return ("*");
        }
    }


    toModel() : Model.Expression {
        let coreData : Model.StarExpression = {};

        if (this._limitedTo) {
            coreData.limitedTo = this._limitedTo;
        }

        return ({
            star : coreData
        });
    }

    /**
     * @return True, a StarExpression is complete by definition if it is not limited.
     *         Otherwise the referenced table must exist.
     */
    validate(schema : Schema) : ValidationResult {
        if (this.isLimited && !schema.hasTable(this.tableName)) {
            return (new ValidationResult([
                new ValidationErrors.UnknownTable(this)
            ]));
        } else {
            return (ValidationResult.VALID);
        }
    }

    /**
     * Throws an exception, as a StarExpression is not allowed to
     * have any children.
     */
    replaceChild(formerChild : Expression, newChild : Expression) {
        throw new Error("The star expression should never have children");
    }

    getLeaves() : Expression[] {
        return [this];
    }
}

/**
 * Combines two expressions into a single expression.
 */
export class BinaryExpression extends Expression {
    private _lhs : Expression;
    private _rhs : Expression;

    private _operator : Model.Operator;
    private _isSimple : boolean;

    constructor(expr : Model.BinaryExpression,
                parent : ExpressionParent) {
        super("binary", parent);

        this._lhs = loadExpression(expr.lhs, this);
        this._rhs = loadExpression(expr.rhs, this);
        this._isSimple = expr.simple;
        this._operator = expr.operator;
    }

    validate(schema : Schema) : ValidationResult {
        return (new ValidationResult([], [
            this._lhs.validate(schema),
            this._rhs.validate(schema)
        ]));
    }

    /**
     * @return The string representation of both operands with
     *         the operator in between.
     */
    toSqlString() : string {
        return (`${this._lhs.toSqlString()} ${this._operator} ${this._rhs.toSqlString()}`)
    }

    /**
     * @return The used operator
     */
    get operator() {
        return (this._operator);
    }

    set operator(operator : Model.Operator) {
        this._operator = operator;
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
        console.log(`BinaryExpression.replaceChild()`);
        if (this._lhs == formerChild) {
            this._lhs = newChild;
        } else if (this._rhs == formerChild) {
            this._rhs = newChild;
        }
    }

    getLeaves() : Expression[] {
        return this._lhs.getLeaves().concat(this._rhs.getLeaves());
    }
}

/**
 * Maps the "one size fits all"-interface for expressions
 * to their concrete classes. Essentially a factory-function.
 */
export function loadExpression(expr : Model.Expression,
                               parent : ExpressionParent) : Expression
{
    if (expr.singleColumn) {
        return new ColumnExpression(expr.singleColumn, parent);
    } else if (expr.binary) {
        return new BinaryExpression(expr.binary, parent);
    } else if (expr.constant) {
        return new ConstantExpression(expr.constant, parent);
    } else if (expr.missing) {
        return new MissingExpression(expr.missing, parent);
    } else if (expr.parameter) {
        return new ParameterExpression(expr.parameter, parent);
    } else if (expr.star) {
        return new StarExpression(expr.star, parent);
    }
    throw new Error(`Unknown expression: ${JSON.stringify(expr)}`);
}
