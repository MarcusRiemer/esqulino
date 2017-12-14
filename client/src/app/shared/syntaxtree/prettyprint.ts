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

  const toReturn = [head, ...nodes, tail] as NestedString

  return (recursiveJoin('\n', '  ', toReturn));
}

/**
 * A possibly infinitely nested list of strings.
 */
interface NestedString extends Array<NestedString | string> {
  [key: number]: Array<NestedString | string> | string;
}

/**
 * "Flattens" the given arbitrarily nested strings to a single string. The resulting
 * string is indented according to the given indentation character which is repeated
 * according to the current nesting level.
 *
 * @param sep The separation character to use after each list
 * @param indent The indentation character to use in front of each item
 * @param n The nested string
 */
export function recursiveJoin(sep: string, indent: string, n: NestedString): string {
  const impl = (sep: string, n: NestedString, depth: number): string => {
    if (typeof n === 'string') {
      return (indent.repeat(depth) + n);
    } else {
      return (
        Object.values(n)
          .map(v => impl(sep, v, depth + 1))
          .join(sep)
      );
    }
  };

  // Run the recursive implementation
  const resultString = impl(sep, n, -1);

  // Get rid of whitespace only lines
  return (resultString);
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
  const toReturn: NestedString = [`node "${name}" {`];

  // Add all properties (if there are any)
  if (t.properties) {
    const attributes = Object.entries(t.properties)
      .map(([propName, prop]) => prettyPrintProperty(propName, prop));
    toReturn.push(...attributes);
  }

  // Add all children (if there are any)
  if (t.children) {
    const children = Object.entries(t.children)
      .map(([groupName, group]) => prettyPrintChildren(groupName, group));
    toReturn.push(...children);
  }

  return ([...toReturn, `}`]);
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
export function prettyPrintProperty(name: string, p: Desc.NodePropertyTypeDescription): NestedString {
  const optional = p.isOptional ? '?' : '';
  const head = `prop${optional} "${name}"`;

  let restrictions: string[] = [];
  if (Desc.isNodePropertyStringDesciption(p) && p.restrictions) {
    restrictions = p.restrictions.map(r => `${r.type}=${r.value}`);
  }

  if (restrictions.length === 0) {
    return ([`${head} { ${p.base} }`]);
  } else if (restrictions.length === 1) {
    return ([`${head} { ${p.base} { ${restrictions[0]} } }`]);
  } else {
    return ([head + " {", [p.base + " {", restrictions, "}"], "}"]);
  }
}

/**
 * Prints the grammar a single child.
 */
export function prettyPrintChildren(name: string, p: Desc.NodeChildrenGroupDescription): string[] {
  const head = `children "${name}" {`;
  const tail = `}`;

  return ([head, tail]);
}

