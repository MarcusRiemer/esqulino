import { ProjectResourceDescription } from '../resource.description'
import { TableDescription } from '../schema'

/**
 * Basic data types as inspired by SQLite.
 */
export type DataType = "INTEGER" | "REAL" | "TEXT";


/**
 * Types of INNER JOINs
 */
export type InnerJoinType = "cross" | "comma"

/**
 * One "typical" logical leaf of an expression tree, postpones
 * the actual value lookup to execution time and ends recursion.
 */
export interface SingleColumnExpression {
  column: string
  table?: string
  alias?: string
}

/**
 * The other "typical" leaf, a compile time expression that also
 * ends recursion.
 */
export interface ConstantExpression {
  // TODO: Remove this with an API bump
  type?: DataType
  value: string
}

export type Operator = "<" | "<=" | "=" | "<>" | ">=" | ">" | "LIKE" | "+" | "-" | "*" | "/"

/**
 * Combines two expressions with a binary operator.
 */
export interface BinaryExpression {
  lhs: Expression
  operator: Operator
  rhs: Expression
  simple: boolean
}

/**
 * Denotes a value that needs to be bound at the runtime of the query.
 */
export interface ParameterExpression {
  key: string
}

/**
 * Denotes an expression that is intentionally missing.
 */
export interface MissingExpression {

}

/**
 * Denotes a *-Expression, that may be limited to a subset of
 * existing tables.
 */
export interface StarExpression {
  limitedTo?: TableNameDefinition
}

/**
 * We use a single base type for all kinds of expression, as
 * this vastly simplifies the storage process. Each kind of
 * concrete expression is stored under a key. Only one of these
 * keys may be set at runtime.
 */
export interface Expression {
  singleColumn?: SingleColumnExpression
  binary?: BinaryExpression
  constant?: ConstantExpression
  missing?: MissingExpression
  parameter?: ParameterExpression
  star?: StarExpression
}

export interface SelectColumn {
  expr: Expression
  as?: string
}

export interface Select {
  columns: SelectColumn[]
}


/**
 * Named tables as described in the FROM
 */
export interface TableNameDefinition {
  name: string
  alias?: string
}

export interface From {
  first: TableNameDefinition
  joins?: Join[]
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
  table: TableNameDefinition
  cross?: InnerJoinType
  inner?: {
    using?: string,
    on?: Expression
  }
}

export type LogicalOperator = "AND" | "OR";

/**
 * All Expressions after the first in a WHERE clause need the
 * logical operation defined. This is redundant, as the 
 * BinaryExpression would be perfectly capable of expressing
 * arbitrarily deep nested logical expressions, but in that
 * case the UI would be less then thrilling.
 */
export interface WhereSubsequent {
  expr: Expression
  logical: LogicalOperator
}

/**
 * A WHERE component with at least one expression.
 */
export interface Where {
  first: Expression
  following?: WhereSubsequent[]
}

/**
 * An expression that will be assigned to a certain column.
 */
export interface ColumnAssignment {
  column: string
  expr: Expression
}

/**
 * A complete INSERT statement. Technically this does not 
 * require any other component, although the use of
 * expressions is common.
 */
export interface Insert {
  table: string
  assignments: ColumnAssignment[];
}

/**
 * The column-expression pairs and the table that define the
 * UPDATE component.
 */
export interface Update {
  table: string
  assignments: ColumnAssignment[]
}

/**
 * Outermost description of a query. This contains
 * the whole structure and some identifying properties.
 */
export interface QueryDescription extends ProjectResourceDescription {
  select?: Select
  delete?: Delete
  insert?: Insert
  update?: Update
  from?: From
  where?: Where

  // Sometimes it is important to know in advance if a query will affect
  // only a single row.
  //
  // * The SELECT query uses this to allow easier databinding to the UI
  // * DELETE and UPDATE queries could use this as a safety net
  singleRow?: boolean
}

