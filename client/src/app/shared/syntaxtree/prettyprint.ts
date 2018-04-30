import { recursiveJoin, NestedString } from '../nested-string'

import { NodeDescription } from './syntaxtree.description'
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
  const head = `node "${name}" {`;

  const attributes = (t.attributes ? t.attributes : []).map(a => {
    if (a.type === "property") {
      return (prettyPrintProperty(a));
    } else {
      return (prettyPrintChildGroup(a));
    }
  });

  if (attributes.length > 0) {
    return ([head, ...attributes, `}`]);
  } else {
    return ([head, `}`]);
  }
}


/**
 * Prints the grammar for a placeholder node.
 */
export function prettyPrintOneOfType(name: string, t: Desc.NodeOneOfTypeDescription): NestedString {
  return ([`typedef "${name}" {`, t.oneOf.map(t => `"${t}"`), `}`]);
}

/**
 * Prints the grammar for a property
 */
export function prettyPrintProperty(p: Desc.NodePropertyTypeDescription): NestedString {
  const optional = p.isOptional ? '?' : '';
  const head = `prop${optional} "${p.name}"`;

  let restrictions: string[] = [];
  if (Desc.isNodePropertyStringDesciption(p) && p.restrictions) {
    restrictions = p.restrictions.map(r => {
      switch (r.type) {
        case "length":
        case "maxLength":
        case "minLength":
          return (`${r.type} ${r.value}`);
        case "enum":
          return (`${r.type} ${r.value.map(v => JSON.stringify(v)).join(' ')}`);
      }
    });
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
export function prettyPrintChildGroup(p: Desc.NodeChildrenGroupDescription): NestedString {
  return ([`children "${p.name}" ::= ` + prettyPrintChildGroupElements(p)]);
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
          .map(c => {
            if (typeof c === "string") {
              return (c);
            } else {
              return (c.languageName + "." + c.typeName);
            }
          })
          .join(` | `)
      )
    default:
      throw new Error(`Can't print child group of type "${(p as any).type}"`);
  }
}

export function prettyPrintSyntaxTree(desc: NodeDescription): string {
  const toReturn = prettyPrintSyntaxTreeNode(desc);
  return (recursiveJoin('\n', '  ', toReturn));
}

/**
 * Pretty prints a node of a syntaxtree. This includes all children of the given node.
 */
export function prettyPrintSyntaxTreeNode(desc: NodeDescription): NestedString {
  const head = `node "${desc.language}.${desc.name}"`;

  const props = Object.entries(desc.properties || {}).map(([key, value]) => [`prop "${key}" ${value}`]);
  const children = Object.entries(desc.children || {}).map(([key, value]) => {
    return ([
      `childGroup "${key}" {`,
      ...value.map(prettyPrintSyntaxTreeNode),
      `}`
    ]);
  });

  if (props.length > 0 || children.length > 0) {
    return ([head + ` {`, ...props, ...children, `}`]);
  } else {
    return ([head]);
  }
}

/**
 * Calculates the graphviz-representation of the given syntaxtree.
 */
export function graphvizSyntaxTree(desc: NodeDescription): string {
  const tree = [
    `digraph SyntaxTree {`,
    [
      `graph [fontsize=10 fontname="Verdana"];`,
      `node [fontsize=10 fontname="Verdana" shape=Mrecord];`,
      `edge [fontsize=10 fontname="Verdana"];`,
    ],
    graphvizSyntaxTreeNode(desc, "r"),
    `}`
  ];
  return (recursiveJoin('\n', '  ', tree));
}

/**
 * Calculates the graphviz-representation of a single node.
 */
export function graphvizSyntaxTreeNode(desc: NodeDescription, path: string): NestedString {
  const props = Object.entries(desc.properties || {})
    .map(([k, v]) => `{${k}|${v}}`)
    .join("|");
  const typename = desc.language + "." + desc.name;

  // The label of the node might or might note incorporate properties
  const nodeLabel = (props != "") ? `{{${typename}}|${props}}` : `{${typename}}`;

  // Render all children in all named child groups
  const childGroups = Object.entries(desc.children || {})
    .map(([k, v]) => {
      return ([
        // Beware: GraphViz requires subgraphs to be prefixed with `cluster_` in order
        // to render a box around it.
        `subgraph cluster_${path}_${k} {`,
        [
          `label="${k}";`
        ],
        // Append the name of the child group and the index of the node to
        // form a unique path
        // This needs to be reversed because otherwise graphviz will show
        // these childre in ... well ... reverse order. The node that is mentioned
        // last seems to be rendered first.
        ...v.map((v, i) => graphvizSyntaxTreeNode(v, `${path}_${k}_${i}`)).reverse(),
        `}`,
        // Create the connectio from the parent
        ...v.map((v, i) => `${path} -> ${path}_${k}_${i};`),
      ]);
    });

  // We need to shave of the outer list of the child groups
  let toReturn = [`${path} [label="${nodeLabel}"];`];
  return (toReturn.concat(...(childGroups as any)));
}
