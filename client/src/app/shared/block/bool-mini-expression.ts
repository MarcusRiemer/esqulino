import { Restricted } from "./bool-mini-expression.description";

/**
 * Evaluates boolean expressions in a (more or less) compact JSON-notation.
 *
 * @param expr The expression to evaluate.
 * @param vars Assignment of variables that may occur in the expression
 */
export function evalExpression<T extends string>(
  expr: Restricted.Expression<T>,
  vars?: Restricted.VariableMap<T>
): boolean {
  // Ensure there is at least an empty variable map
  if (!vars) {
    vars = {} as Restricted.VariableMap<T>;
  }

  if (Restricted.isValue(expr)) {
    return expr.$value;
  } else if (Restricted.isVariable(expr)) {
    // Variables may need to be evaluated when they are encountered
    // for the first time.
    let val = vars[expr.$var];
    if (val instanceof Function) {
      // Evaluate the function and write the result back
      val = val.call(this);
      vars[expr.$var] = val;
    }

    return !!val;
  } else if (Restricted.isNot(expr)) {
    return !evalExpression(expr.$not, vars);
  } else if (Restricted.isAnd(expr)) {
    return expr.$every.every((value) => evalExpression(value, vars));
  } else if (Restricted.isOr(expr)) {
    return expr.$some.some((value) => evalExpression(value, vars));
  } else {
    throw new Error(`Unknow Expression: ${JSON.stringify(expr)}`);
  }
}
