/**
 * Used when refererring to types that are defined other languages.
 */
export interface QualifiedTypeName {
  typeName: string;
  languageName: string;
}

/**
 * Determines the category and the index in that category
 * of a node.
 */
export type NodeLocationStep = [string, number];

/**
 * Contains the path to find a certain node in a syntax tree.
 * These paths currently always start from the root node.
 */
export type NodeLocation = NodeLocationStep[];

/**
 * This description regulates how all ASTs should be stored when
 * written to disk or sent over the wire. It requires every
 * node to at least tell its name and some hint how a node can be
 * constructed at runtime.
 *
 * The data of a node is split up in two broader categories:
 * Children, which may be nested and properties, which should
 * not allow any nesting.
 */
export interface NodeDescription {
  /**
   * The name of this not, this is used to lookup the name of a
   * corresponding type.
   */
  name: string;

  /**
   * This is effectively a namespace, allowing identical
   * names for nodes in different languages.
   */
  language: string;

  /**
   * Nodes may have children in various categories. This base class
   * makes no assumptions about the names of children. Examples for
   * children in multiple categories would be things like "attributes"
   * and generic "children" in a specialization for XML.
   */
  children?: {
    [childrenCategory: string]: NodeDescription[];
  };

  /**
   * Nodes may have all kinds of properties that are specific to their
   * concrete use.
   */
  properties?: {
    [propertyName: string]: string;
  };
}

/**
 * Locates a node in the description of a syntax tree.
 *
 * @param root The root to search from.
 * @param loc The location of the target node.
 * @return The description of the node in the given tree at the given location.
 */
export function locateNode(
  root: NodeDescription,
  loc: NodeLocation
): NodeDescription {
  let current: NodeDescription = root;
  loc.forEach(([categoryName, childIndex], i) => {
    const children = current.children[categoryName];
    if (children && childIndex < children.length && childIndex >= 0) {
      current = children[childIndex];
    } else {
      throw new Error(
        `SyntaxTreeDescription: Could not locate step ${i} of ${JSON.stringify(
          loc
        )}`
      );
    }
  });

  return current;
}
