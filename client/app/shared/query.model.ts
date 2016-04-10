import {Table}                          from './table'

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
     * Denotes a value that needs to be bound at the runtime of the query.
     */
    export interface ParameterExpression {
        key : string
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
        parameter? : ParameterExpression
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

    /**
     * There doesn't seem to be any data associated with the
     * SQLite DELETE keyword itself. But it didn't seem practical
     * to go with a "simple" type that breaks the "normal" 
     * structure of the model.
     */
    export interface Delete {

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
        select? : Select,
        delete? : Delete,
        from? : From,
        where? : Where,
        name : string,
        id : string
    }
}

