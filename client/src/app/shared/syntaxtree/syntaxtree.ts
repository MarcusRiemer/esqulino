import { NodeDescription, } from './syntaxtree.description'

export { NodeDescription };

/**
 * Used when refererring to types that are defined other languages.
 */
export interface QualifiedTypeName {
  typeName: string
  languageName: string
}

/**
 * Properties of a node are atomic and always stored as string.
 * Certain validators may be used to check whether the string
 * contains something useful.
 */
type NodeProperties = { [propertyName: string]: string }

/**
 * Children of a node are always sorted.
 */
export type NodeChildren = { [childrenCategory: string]: Node[] }

/**
 * The core building block of the AST is this class. It contains
 * enough information to build arbitrarily structured trees. There
 * are no compile-time checks to do any kind of validation, these
 * checks can only be made at runtime.
 */
export class Node {
  private _nodeName: string
  private _nodeLanguage: string
  private _nodeProperties: NodeProperties
  private _nodeChildren: NodeChildren

  private _nodeParent: Node

  /**
   * The constructor is responsible to transfer relevant description
   * properties and to construct any children.
   */
  constructor(desc: NodeDescription, parent: Node) {
    this._nodeName = desc.name;
    this._nodeLanguage = desc.language;
    this._nodeParent = parent;

    // We don't want any undefined fields during runtime
    this._nodeProperties = {}
    this._nodeChildren = {}

    // Load properties (if there are any)
    if (desc.properties) {
      // Make a deep copy of those properties, just in case ...
      this._nodeProperties = JSON.parse(JSON.stringify(desc.properties));
    }

    // Load children (if there are any)
    if (desc.children) {
      // Load all children in all categories
      for (let categoryName in desc.children) {
        const category = desc.children[categoryName];
        this._nodeChildren[categoryName] = category.map(childDesc => new Node(childDesc, this))
      }
    }
  }

  /**
   * @return The description of this node and all of it's properties and children.
   */
  toModel(): NodeDescription {
    // Primitive values and properties
    const toReturn: NodeDescription = {
      name: this.typeName,
      language: this.languageName,
    };

    // Carry over properties (if there are any)
    if (this.hasProperties) {
      toReturn.properties = JSON.parse(JSON.stringify(this._nodeProperties))
    }

    // Carry over children (if there are any)
    if (this.hasChildren) {
      toReturn.children = {};
      Object.entries(this._nodeChildren).forEach(([name, children]) => {
        toReturn.children[name] = children.map(child => child.toModel());
      });
    }

    return (toReturn);
  }

  /**
   * @return The name of the type this node should be validated against.
   */
  get typeName(): string {
    return (this._nodeName);
  }

  /**
   * @return The name of the language containing the type this node should be validated against.
   */
  get languageName(): string {
    return (this._nodeLanguage);
  }

  /**
   * @return The fully qualified of the type of this node.
   */
  get qualifiedName(): QualifiedTypeName {
    return ({
      typeName: this.typeName,
      languageName: this.languageName
    });
  }

  /**
   * @return All children in that category or an empty list if the category does not exist.
   */
  getChildrenInCategory(categoryName: string): Node[] {
    const result = this._nodeChildren[categoryName];
    if (result) {
      return (result);
    } else {
      return ([]);
    }
  }

  /**
   * @return The names of the available categories.
   */
  get childrenCategoryNames() {
    return (Object.keys(this._nodeChildren));
  }

  /**
   * @return True if this node has any children in any category
   */
  get hasChildren() {
    const categories = Object.values(this._nodeChildren);
    return (categories.some(c => c.length > 0));
  }

  /**
   * @return All children in all categories.
   */
  get children() {
    return (this._nodeChildren);
  }

  /**
   * @return True if this node has any properties.
   */
  get hasProperties() {
    return (Object.keys(this._nodeProperties).length > 0);
  }

  /**
   * @return All properties with keys and values.
   */
  get properties(): NodeProperties {
    return (this._nodeProperties);
  }

  /**
   * @return The node parenting this one.
   */
  get nodeParent(): Node {
    return (this._nodeParent);
  }
}

