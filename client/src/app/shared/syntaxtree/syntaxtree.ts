import { NodeDescription } from './syntaxtree.description'

export { NodeDescription };

/**
 * Properties of a node are simply stored without ever
 * looking inside them.
 */
type NodeProperties = { [propertyName: string]: any }

/**
 * Children of a node are always sorted.
 */
type NodeChildren = { [childrenCategory: string]: Node[] }

/**
 * The core building block of the AST is this class. It contains
 * enough information to build arbitrarily structured trees. There
 * are no compile-time checks to do any kind of validation, these
 * checks can only be made at runtime.
 *
 * All members of this description are prefixed with "node" to
 * minimise the chance of name clashes.
 */
export abstract class Node {
  private _nodeName: string
  private _nodeProperties: NodeProperties
  private _nodeChildren: NodeChildren

  private _nodeParent: Node

  /**
   * The constructor is responsible to transfer relevant description
   * properties and does nothing else. Most importantly, it does not
   * do any kind of validation
   */
  constructor(desc: NodeDescription, parent: Node) {
    this._nodeName = desc.nodeName;
    this._nodeParent = parent;

    // Make a deep copy of those properties, just in case ...
    this._nodeProperties = JSON.parse(JSON.stringify(desc.nodeProperties));
  }

  get nodeName(): string {
    return (this._nodeName);
  }

  get nodeChildren(): NodeChildren {
    return (this._nodeChildren);
  }

  get nodeProperties(): NodeProperties {
    return (this._nodeProperties);
  }

  /**
   * @return The node parenting this one.
   */
  get nodeParent(): Node {
    return (this._nodeParent);
  }
}
