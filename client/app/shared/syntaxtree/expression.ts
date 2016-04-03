import {
    Expression, ExpressionParent, DataType,
    serializeDataType, parseDataType
} from './common'
import {Model}      from '../query.model'



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
    }
    throw { "error" : `Unknown expression: ${JSON.stringify(expr)}` }
}


