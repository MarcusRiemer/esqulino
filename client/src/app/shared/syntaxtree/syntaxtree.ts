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
 */
export class Node {
  private _nodeName: string
  private _nodeFamily: string
  private _nodeProperties: NodeProperties
  private _nodeChildren: NodeChildren

  private _nodeParent: Node

  /**
   * The constructor is responsible to transfer relevant description
   * properties and to construct any children.
   */
  constructor(desc: NodeDescription, parent: Node) {
    this._nodeName = desc.nodeName;
    this._nodeFamily = desc.nodeFamily;
    this._nodeParent = parent;

    // We don't want any undefined fields during runtime
    this._nodeProperties = {}
    this._nodeChildren = {}

    // Load properties (if there are any)
    if (desc.nodeProperties) {
      // Make a deep copy of those properties, just in case ...
      this._nodeProperties = JSON.parse(JSON.stringify(desc.nodeProperties));
    }

    // Load children (if there are any)
    if (desc.nodeChildren) {
      // Load all children in all categories
      for (let categoryName in desc.nodeChildren) {
        const category = desc.nodeChildren[categoryName];
        this._nodeChildren[categoryName] = category.map(childDesc => new Node(childDesc, this))
      }
    }
  }

  get nodeName(): string {
    return (this._nodeName);
  }

  get nodeFamily(): string {
    return (this._nodeFamily);
  }

  getChildren(categoryName: string): Node[] {
    const result = this._nodeChildren[categoryName];
    if (result) {
      return (result);
    } else {
      return ([]);
    }
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

