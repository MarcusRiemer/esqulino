import { recursiveJoin, NestedString } from '../nested-string'

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
      .map(([groupName, group]) => prettyPrintChildGroup(groupName, group));
    toReturn.push(children);
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
 * Takes a node reference, possibly with its cardinality description,
 * and returns a pretty string version of it. The cardinalities are
 * mapped to the standard regex operators ?,+ and * or expressed using
 * the {min,max}-bracket notation.
 */
export function prettyPrintTypeReference(t: Desc.NodeTypesChildReference) {
  if (Desc.isQualifiedTypeName(t)) {
    return (`${t.languageName}.${t.typeName}`);
  } else if (Desc.isChildCardinalityDescription(t)) {
    const printCardinality = (t: Desc.OccursDescription) => {
      if (typeof t === "string") {
        return (t);
      } else {
        if (t.minOccurs === 0 && t.maxOccurs === 1) {
          return ("?");
        } else if (t.minOccurs === 1 && (t.maxOccurs === undefined || t.maxOccurs === +Infinity)) {
          return ("+");
        } else if (t.minOccurs === 0 && (t.maxOccurs === undefined || t.maxOccurs === +Infinity)) {
          return ("*");
        } else {
          if (t.minOccurs === undefined) {
            return (`{,${t.maxOccurs}}`);
          } else if (t.maxOccurs === undefined) {
            return (`{${t.minOccurs},}`);
          } else {
            return (`{${t.minOccurs},${t.maxOccurs}}`);
          }
        }
      }
    };

    const printedName = prettyPrintTypeReference(t.nodeType);
    return (`${printedName}${printCardinality(t.occurs)}`);
  } else {
    return (t);
  }
}

/**
 * Prints the grammar of a single child group.
 */
export function prettyPrintChildGroup(name: string, p: Desc.NodeChildrenGroupDescription): string {
  return (`children "${name}" ::= ` + prettyPrintChildGroupElements(p));
}

/**
 * Prints the elements of a single child group. This may be a simple list of elements
 * (for "sequence" and "allowed" groups) or recursive definitions of child groups ("choice").
 */
function prettyPrintChildGroupElements(p: Desc.NodeChildrenGroupDescription): string {
  // Sequences and allowed groups can be printed by simply joining the elements
  switch (p.type) {
    case "sequence":
    case "allowed":
      // Figuring out the connector
      let connector = (p) => {
        if (Desc.isNodeTypesAllowedDescription(p)) {
          return (' & ');
        } else {
          return (' ');
        }
      };

      return (
        p.nodeTypes
          .map(prettyPrintTypeReference)
          .join(connector(p))
      );

    case "choice":
      return (
        p.choices
          // Recursive call
          .map(prettyPrintChildGroupElements)
          .map(e => `(${e})`)
          .join(` | `)
      )
    default:
      throw new Error(`Can't print child group of type "${(p as any).type}"`);
  }
}
