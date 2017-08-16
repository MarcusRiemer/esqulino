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
   * The name of this not, this is equivalent to its type.
   */
  nodeName: string

  /**
   * This name is required to determine how to load this node.
   */
  nodeLoader: string

  /**
   * Nodes may have children in various categories. This base class
   * makes no assumptions about the names of children. Examples for
   * children in multiple categories would be things like "attributes"
   * and generic "children" in a specialization for XML.
   */
  nodeChildren: {
    [childrenCategory: string]: NodeDescription[];
  }

  /**
   * Nodes may have all kinds of properties that are specific to their
   * concrete use.
   */
  nodeProperties: {
    [propertyName: string]: any;
  }
}
