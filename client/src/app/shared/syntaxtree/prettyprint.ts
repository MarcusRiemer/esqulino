import * as Desc from './validator.description'

/**
 * Converts the internal structure of a grammar into a more readable
 * version that reads similar to RelaxNG.
 */
export function prettyPrintGrammar(g: Desc.GrammarDescription): string {
  const head = `grammar "${g.languageName}" {`;
  const tail = `}`;

  const nodes = Object.entries(g.types)
    .map(([name, t]) => prettyPrintType(name, t))

  return (recursiveJoin('\n', [head, nodes, tail] as NestedString));
}

interface NestedString {
  [key: number]: Array<NestedString | string> | string;
}

/**
 * "Flattens" the given arbitrarily nested strings to a single string.
 *
 * @param sep The separation character to use
 * @param n The nested string
 */
export function recursiveJoin(sep: string, n: NestedString): string {
  const impl = (sep: string, n: NestedString, depth: number): string => {
    if (typeof n === 'string') {
      return ('  '.repeat(depth) + n);
    } else {
      return (
        Object.values(n)
          .map(v => impl(sep, v, depth + 1))
          .join(sep)
      );
    }
  };

  return (impl(sep, n, -1));
}

/**
 * Picks the correct pretty printer for a certain type.
 */
export function prettyPrintType(name: string, t: Desc.NodeTypeDescription): NestedString {
  if (Desc.isNodeConcreteTypeDescription(t)) {
    return prettyPrintConcreteNodeType(name, t);
  } else if (Desc.isNodeOneOfTypeDescription(t)) {
    return prettyPrintOneOfType(name, t);
  } else {
    throw Error(`Unknown type "${name}" to pretty print: ${JSON.stringify(t)}`);
  }
}

/**
 * Prints the grammar for a concrete node.
 */
export function prettyPrintConcreteNodeType(name: string, t: Desc.NodeConcreteTypeDescription): NestedString {
  const head = `node "${name}" {`
  const tail = `}`;

  const attributes = Object.entries(t.properties || {})
    .map(([propName, prop]) => prettyPrintProperty(propName, prop));

  const children = Object.entries(t.children || {})
    .map(([groupName, group]) => prettyPrintChildren(groupName, group));

  return ([head, ...attributes, ...children, tail]);
}


/**
 * Prints the grammar for a placeholder node.
 */
export function prettyPrintOneOfType(name: string, t: Desc.NodeOneOfTypeDescription): string[] {
  return ([]);
}

/**
 * Prints the grammar for a property
 */
export function prettyPrintProperty(name: string, p: Desc.NodePropertyTypeDescription): string[] {
  const head = `prop "${name}" { ${p.base}`;

  let restrictions = [];
  if (Desc.isNodePropertyStringDesciption(p) && p.restrictions) {
    restrictions = p.restrictions.map(r => `${r.type}=${r.value}`);
  }

  const tail = `}`;

  if (restrictions.length > 0) {
    return ([head, "{", ...restrictions, "}", tail]);
  } else {
    return ([head, tail]);
  }
}

export function prettyPrintChildren(name: string, p: Desc.NodeChildrenGroupDescription): string[] {
  const head = `children "${name}" {`;
  const tail = `}`;

  return ([head, tail]);
}

