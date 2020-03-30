/**
 * A function that takes no parameter and and calculates a boolean value.
 * May be used instead of an actual boolean value for late binding.
 */
export type ValueFunction = () => boolean;

/**
 * Boolean expressions on a set of known variable names.
 */
export namespace Restricted {
  export type Value = { $value: boolean };
  export type Variable<TKey> = { $var: TKey };

  export type OperationEvery<TKey> = { $every: Expression<TKey>[] };
  export type OperationSome<TKey> = { $some: Expression<TKey>[] };
  export type OperationNot<TKey> = { $not: Expression<TKey> };
  export type Operation<TKey> =
    | OperationEvery<TKey>
    | OperationSome<TKey>
    | OperationNot<TKey>;

  export type Expression<TKey> = Value | Variable<TKey> | Operation<TKey>;

  export type VariableMap<TKey extends string> = {
    [P in TKey]: boolean | ValueFunction;
  };

  export function isValue(obj: any): obj is Value {
    return typeof obj === "object" && "$value" in obj;
  }

  export function isVariable<TKey>(obj: any): obj is Variable<TKey> {
    return typeof obj === "object" && "$var" in obj;
  }

  export function isAnd<TKey>(obj: any): obj is OperationEvery<TKey> {
    return typeof obj === "object" && "$every" in obj;
  }

  export function isOr<TKey>(obj: any): obj is OperationSome<TKey> {
    return typeof obj === "object" && "$some" in obj;
  }

  export function isNot<TKey>(obj: any): obj is OperationNot<TKey> {
    return typeof obj === "object" && "$not" in obj;
  }
}

/**
 * Boolean expression that may use any variable name. This may lead to
 * surprising results when evaluating an expression.
 */
export namespace Unrestricted {
  export type Value = Restricted.Value;
  export type Variable = Restricted.Variable<string>;

  export type OperationEvery = Restricted.OperationEvery<string>;
  export type OperationSome = Restricted.OperationSome<string>;
  export type OperationNot = Restricted.OperationNot<string>;
  export type Operation = OperationEvery | OperationSome | OperationNot;

  export type Expression = Value | Variable | Operation;

  export type VariableMap = Restricted.VariableMap<string>;
}
