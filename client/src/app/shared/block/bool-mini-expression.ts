import { Restricted } from './bool-mini-expression.description'

export function evalExpression<T extends string>(
  expr: Restricted.Expression<T>,
  vars?: Restricted.VariableMap<T>
): boolean {
  if (!vars) {
    vars = {} as Restricted.VariableMap<T>;
  }

  const impl = () => {
    if (Restricted.isValue(expr)) {
      return (expr.$value);
    } else if (Restricted.isVariable(expr)) {
      return (!!vars[expr.$var]);
    } else if (Restricted.isNot(expr)) {
      return (!evalExpression(expr.$not, vars));
    } else if (Restricted.isAnd(expr)) {
      return (expr.$every.every(value => evalExpression(value, vars)));
    } else if (Restricted.isOr(expr)) {
      return (expr.$some.some(value => evalExpression(value, vars)));
    } else {
      throw new Error(`Unknow Expression: ${JSON.stringify(expr)}`);
    }
  }

  console.log(expr, `with`, vars, `=>`, impl());
  return (impl());
}
