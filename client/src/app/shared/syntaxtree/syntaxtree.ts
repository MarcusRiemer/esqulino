import {
  NodeDescription,
  NodeLocation,
  NodeLocationStep,
  QualifiedTypeName,
  locateNode,
} from "./syntaxtree.description";
import { arrayEqual } from "../util";

export {
  NodeDescription,
  NodeLocation,
  NodeLocationStep,
  QualifiedTypeName,
  locateNode,
};

/**
 * @return True, if both parameters denote the same type.
 */
export function typenameEquals(lhs: QualifiedTypeName, rhs: QualifiedTypeName) {
  return lhs.languageName === rhs.languageName && lhs.typeName === rhs.typeName;
}

/**
 * @return A human friendly name to read
 */
export function printableTypename(n: SyntaxNode | NodeDescription): string {
  const langName = n instanceof SyntaxNode ? n.languageName : n.language;
  const typeName = n instanceof SyntaxNode ? n.typeName : n.name;
  return `"${langName}.${typeName}"`;
}

/**
 * @return Possibly helpful information about the node during debugging
 */
export function printableNodeDebug(n: SyntaxNode) {
  const path = JSON.stringify(n.location);
  return `${printableTypename(n)} at ${path}`;
}

/**
 * @return True, if both locations are identical
 */
export function locationEquals(lhs: NodeLocation, rhs: NodeLocation): boolean {
  if (!lhs || !rhs) {
    return false;
  }

  if (lhs === rhs) {
    return true;
  }

  if (lhs.length != rhs.length) {
    return false;
  }

  // Length is the same, so it does not matter which side is checked
  return lhs.every((_, i) => {
    return arrayEqual(lhs[i], rhs[i]);
  });
}

/**
 * @param loc The path that may partially appear
 * @param fullPath The path that is traced from the root.
 * @return The number of path segments that match beginning at the root.
 */
export function locationMatchingLength(
  loc: NodeLocation,
  fullPath: NodeLocation
): number | false {
  if (!loc || !fullPath) {
    return false;
  }

  if (loc === fullPath) {
    return loc.length;
  }

  // The full path must be at least as long as the given path
  if (loc.length > fullPath.length) {
    return false;
  }

  // Count number of matching segments from the root
  let count = 0;
  for (let i = 0; i < loc.length; ++i) {
    if (arrayEqual(loc[i], fullPath[i])) {
      count++;
    } else {
      break;
    }
  }

  return count;
}

export function isChildLocation(
  childPath: NodeLocation,
  parentPath: NodeLocation,
  maxTimesRemoved = Infinity
): boolean {
  const pathDifference = childPath.length - parentPath.length;
  if (pathDifference <= 0 || pathDifference > maxTimesRemoved) {
    return false;
  } else {
    // Important: We swap the order of fullPath and childPath here
    // because the childPath ist expected to be longer.
    const matchLength = locationMatchingLength(parentPath, childPath);
    return (
      (matchLength === false && parentPath.length === 0) ||
      matchLength === parentPath.length
    );
  }
}

/**
 *
 */
export function locationSibling(
  loc: NodeLocation,
  change: 1 | -1 | -2 = +1
): NodeLocation {
  if (loc.length > 0) {
    const [c, i] = loc[loc.length - 1];
    return [...loc.slice(0, -1), [c, i + change]];
  } else {
    return [];
  }
}

export function locationSiblingOrder(
  lhs: NodeLocation,
  rhs: NodeLocation
): "begin" | "end" {
  const lhsIndex = lhs[lhs.length - 1][1];
  const rhsIndex = rhs[rhs.length - 1][1];

  if (lhsIndex < rhsIndex) {
    return "end";
  } else {
    return "begin";
  }
}

/**
 * Properties of a node are atomic and always stored as string.
 * Certain validators may be used to check whether the string
 * contains something useful.
 */
type NodeProperties = { [propertyName: string]: string };

/**
 * Children of a node are always sorted.
 */
export type NodeChildren = { [childrenCategory: string]: SyntaxNode[] };

/**
 * The core building block of the AST is this class. It contains
 * enough information to build arbitrarily structured trees. There
 * are no compile-time checks to do any kind of validation, these
 * checks can only be made at runtime.
 */
export class SyntaxNode {
  /**
   * @return The name of the type this node should be validated against.
   */
  readonly typeName: string;

  /**
   * @return The name of the language containing the type this node should be validated against.
   */
  readonly languageName: string;

  /**
   * @return All children in all categories.
   */
  readonly children: NodeChildren;

  /**
   * @return All properties with keys and values.
   */
  readonly properties: NodeProperties;

  private _nodeParent: SyntaxNode | SyntaxTree;

  /**
   * The constructor is responsible to transfer relevant description
   * properties and to construct any children.
   */
  constructor(desc: NodeDescription, parent: SyntaxNode | SyntaxTree) {
    this.typeName = desc.name;
    this.languageName = desc.language;
    this._nodeParent = parent;

    // Take over read only properties
    this.properties = Object.freeze(desc.properties ?? {});

    // Load children (if there are any)
    this.children = {};
    if (desc.children) {
      // Load all children in all categories
      for (let categoryName in desc.children) {
        const category = desc.children[categoryName];
        this.children[categoryName] = category.map(
          (childDesc) => new SyntaxNode(childDesc, this)
        );
      }
    }

    Object.freeze(this);
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
      toReturn.properties = JSON.parse(JSON.stringify(this.properties));
    }

    // Carry over children (if there are any)
    if (Object.keys(this.children).length > 0) {
      toReturn.children = {};
      Object.entries(this.children).forEach(([name, children]) => {
        toReturn.children[name] = children.map((child) => child.toModel());
      });
    }

    return toReturn;
  }

  /**
   * @return The fully qualified of the type of this node.
   */
  get qualifiedName(): QualifiedTypeName {
    return {
      typeName: this.typeName,
      languageName: this.languageName,
    };
  }

  /**
   * @return All children in that category or an empty list if the category does not exist.
   */
  getChildrenInCategory(categoryName: string): SyntaxNode[] {
    const result = this.children[categoryName];
    if (result) {
      return result;
    } else {
      return [];
    }
  }

  /**
   * @return The single child in a specific category, or undefined if no such child
   *         or category exists.
   */
  getChildInCategory(categoryName: string): SyntaxNode {
    const result = this.getChildrenInCategory(categoryName);
    if (result.length > 0) {
      return result[0];
    } else {
      return undefined;
    }
  }

  /**
   * @return The names of the available categories.
   */
  get childrenCategoryNames() {
    return Object.keys(this.children);
  }

  /**
   * @return True if this node has any children in any category
   */
  get hasChildren() {
    const categories = Object.values(this.children);
    return categories.some((c) => c.length > 0);
  }

  /**
   * @return True if this node has any properties.
   */
  get hasProperties() {
    return Object.keys(this.properties).length > 0;
  }

  /**
   * @return The node parenting this one.
   */
  get nodeParent(): SyntaxNode {
    if (this._nodeParent instanceof SyntaxNode) {
      return this._nodeParent;
    } else {
      return undefined;
    }
  }

  /**
   * @return The category this node inhabits in its parent
   */
  get nodeParentCategory(): string {
    const parent = this.nodeParent;
    if (parent) {
      const loc = this.location;
      return loc[loc.length - 1][0];
    } else {
      return undefined;
    }
  }

  /**
   * @return The tree this node is a part of.
   */
  get tree(): SyntaxTree {
    let p: any = this._nodeParent;
    while (p && !(p instanceof SyntaxTree)) {
      p = p._nodeParent;
    }

    if (p instanceof SyntaxTree) {
      return p;
    } else {
      return undefined;
    }
  }

  /**
   * @return The location of this node in the tree.
   */
  get location(): NodeLocation {
    return this.treePathImpl([]);
  }

  /**
   * Calculates a path to this node by walking up the tree and finding out where exactly
   * in the parent the current node is stored.
   */
  private treePathImpl(prev: NodeLocation): NodeLocation {
    // The root node uses the empty path
    if (this._nodeParent instanceof SyntaxTree) {
      return prev;
    } else {
      // Take all categories of the parent object
      const found = Object.entries(this._nodeParent.children).some(
        ([categoryName, children]) => {
          // And look for ourself
          const childIndex = children.indexOf(this);
          if (childIndex >= 0) {
            // Update the location parameter
            prev = [[categoryName, childIndex], ...prev];
            return true;
          } else {
            return false;
          }
        }
      );

      if (!found) {
        throw new Error("Node must exist in parent!");
      }

      return this._nodeParent.treePathImpl(prev);
    }
  }

  /**
   * Searches for all nodes of a specific type that are part of this subtree.
   *
   * @return An array of with nodes that match the given type.
   */
  getNodesOfType(typename: QualifiedTypeName): SyntaxNode[] {
    // Initial assumption: No matching node
    let toReturn: SyntaxNode[] = [];

    // Is this node of a matching type?
    if (typenameEquals(this.qualifiedName, typename)) {
      toReturn.push(this);
    }

    // Does any child node match?
    Object.values(this.children).forEach((children) => {
      children.forEach((child) => {
        toReturn.push(...child.getNodesOfType(typename));
      });
    });

    return toReturn;
  }

  /**
   * Collects all typenames that exist as part of this tree. Because JavaScript Sets
   * compare things by reference we have to serialize all qualified names to JSON-strings
   * and rework them later ...
   */
  collectTypes(collected: Set<string>) {
    collected.add(JSON.stringify(this.qualifiedName));
    Object.values(this.children).forEach((cat) => {
      cat.forEach((n) => n.collectTypes(collected));
    });

    return collected;
  }
}

/**
 * Acts as a "virtual" element above the root to ease manipulations
 * of syntaxtrees.
 */
export class SyntaxTree {
  private _root: SyntaxNode;

  constructor(rootDesc?: NodeDescription) {
    if (rootDesc) {
      this._root = new SyntaxNode(rootDesc, this);
    }

    Object.freeze(this);
  }

  /**
   * @return The root for the tree.
   */
  get rootNode(): SyntaxNode {
    if (this.isEmpty) {
      throw new Error("No root node available, tree is empty");
    }

    return this._root;
  }

  /**
   * @return True if this tree is actually empty.
   */
  get isEmpty(): boolean {
    return !this._root;
  }

  /**
   * @return The JSON description of this tree. If the tree is empty
   *         the description is undefined.
   */
  toModel() {
    if (this.isEmpty) {
      return undefined;
    } else {
      return this.rootNode.toModel();
    }
  }

  /**
   * @return All types that are present in this tree, sadly as a Set of "JSON-strings".
   */
  get typesPresent(): Set<string> {
    if (this.isEmpty) {
      return new Set();
    } else {
      return this.rootNode.collectTypes(new Set());
    }
  }

  /**
   * @return The node at the given location.
   */
  locate(loc: NodeLocation): SyntaxNode {
    if (this.isEmpty) {
      throw new Error(
        `SyntaxTree: Could not locate ${JSON.stringify(loc)} in an empty tree`
      );
    }

    let current: SyntaxNode = this._root;
    loc.forEach(([categoryName, childIndex], i) => {
      const children = current.children[categoryName];
      if (children && childIndex < children.length && childIndex >= 0) {
        current = children[childIndex];
      } else {
        const currentLevel = Object.entries(current.children)
          .map(([k, v]) => `${k}[${v.length}]`)
          .join(", ");
        throw new Error(
          `SyntaxTree: Could not locate step ${i} of ${JSON.stringify(
            loc
          )} of ${currentLevel}`
        );
      }
    });

    return current;
  }

  /**
   * @return The node at the given location or `undefined` if no such node exists.
   */
  locateOrUndefined(loc: NodeLocation): SyntaxNode | undefined {
    try {
      return this.locate(loc);
    } catch {
      return undefined;
    }
  }

  /**
   * Returns a new tree where the node at the given location is replaced.
   *
   * @param loc The location of the node to replace.
   * @param desc The new node to insert at its place
   * @return The modified tree.
   */
  replaceNode(loc: NodeLocation, desc: NodeDescription): SyntaxTree {
    // Replacing the root needs to work different because there is no parent
    // that needs a child replaced.
    if (loc.length === 0) {
      return new SyntaxTree(desc);
    } else {
      // Build the description of the current tree to replace the new node in it
      let newDescription = this.toModel();

      // Walking up the tree to the parent of the node to replace
      let parent = locateNode(newDescription, loc.slice(0, loc.length - 1));
      let [parentCat, parentIndex] = loc[loc.length - 1];

      // Actually replace the node and build the new tree
      parent.children[parentCat][parentIndex] = desc;
      return new SyntaxTree(newDescription);
    }
  }

  /**
   * Returns a new three where a new node is inserted at the given location.
   *
   * @param loc The location of the insertion.
   * @param desc The node to insert
   * @return The modified tree
   */
  insertNode(loc: NodeLocation, desc: NodeDescription): SyntaxTree {
    // The root can only be replaced, not extended.
    if (loc.length === 0) {
      // Inserting is equivalent to replacing on an empty tree
      if (this.isEmpty) {
        return this.replaceNode([], desc);
      } else {
        throw new Error(`Nothing can be appended after the root node.`);
      }
    } else {
      // Build the description of the current tree to insert the new node in it
      let newDescription = this.toModel();

      // Walking up the tree to the parent that will contain the new node
      let parent = locateNode(newDescription, loc.slice(0, loc.length - 1));
      let [parentCat, parentIndex] = loc[loc.length - 1];

      // Create a place for children, if no children exist so far
      if (!parent.children) {
        parent.children = {};
      }

      // Create the category if it doesn't exist so far.
      if (!parent.children[parentCat]) {
        parent.children[parentCat] = [];
      }

      // Append the node in the category and build the new tree
      let cat = parent.children[parentCat];
      cat.splice(parentIndex, 0, desc);
      return new SyntaxTree(newDescription);
    }
  }

  /**
   * Returns a new tree where the node at the given location is deleted.
   *
   * @param loc The location of the deletion.
   * @return The modified tree
   */
  deleteNode(loc: NodeLocation): SyntaxTree {
    // The root can only be replaced, not deleted.
    if (loc.length === 0) {
      return new SyntaxTree(undefined);
    } else {
      // Build the description of the current tree to insert the new node in it
      let newDescription = this.toModel();

      // Walking up the tree to the parent that will contain the node that needs
      // to be deleted.
      let parent = locateNode(newDescription, loc.slice(0, loc.length - 1));
      let [parentCat, parentIndex] = loc[loc.length - 1];

      // Actually delete the node
      parent.children[parentCat].splice(parentIndex, 1);

      return new SyntaxTree(newDescription);
    }
  }

  /**
   * Returns a new tree where the node at the given location has a different
   * property value.
   *
   * @param loc The location of the node to edit.
   * @param key The name of the property.
   * @param value The new value of the property.
   * @return The modified tree.
   */
  setProperty(loc: NodeLocation, key: string, value: string): SyntaxTree {
    let newDescription = this.toModel();
    let node = locateNode(newDescription, loc);

    // The property object itself might not exist
    if (!node.properties) {
      node.properties = {};
    }

    node.properties[key] = value.toString();

    return new SyntaxTree(newDescription);
  }

  /**
   * Adds a new property without specifying a value.
   *
   * @param loc The location of the node to edit.
   * @param key The name of the property.
   * @return The modified tree.
   */
  addProperty(loc: NodeLocation, key: string): SyntaxTree {
    let newDescription = this.toModel();
    let node = locateNode(newDescription, loc);

    if (node.properties && key in node.properties) {
      throw new Error(
        `Can not add property "${key}" at ${JSON.stringify(
          loc
        )}: Name already exists`
      );
    } else {
      return this.setProperty(loc, key, "");
    }
  }

  /**
   * Returns a new tree where the given property has been renamed.
   *
   * @param loc The location of the node to edit.
   * @param key The name of the property.
   * @param newKey The new name of the property.
   * @return The modified tree.
   */
  renameProperty(loc: NodeLocation, key: string, newKey: string): SyntaxTree {
    let newDescription = this.toModel();
    let node = locateNode(newDescription, loc);

    if (!node.properties || !node.properties[key]) {
      throw new Error(
        `Could not rename property "${key}" at ${JSON.stringify(
          loc
        )}: Doesn't exist`
      );
    }

    if (newKey in node.properties) {
      throw new Error(
        `Could not rename property "${key}" to "${newKey}" at ${JSON.stringify(
          loc
        )}: New name exists`
      );
    }

    node.properties[newKey] = node.properties[key];
    delete node.properties[key];

    return new SyntaxTree(newDescription);
  }

  /**
   * Returns a new tree where an empty childgroup has been added.
   *
   * @param loc The location of the node to edit.
   * @param key The name of the child group.
   * @return The modified tree.
   */
  addChildGroup(loc: NodeLocation, key: string): SyntaxTree {
    let newDescription = this.toModel();
    let node = locateNode(newDescription, loc);

    if (!node.children) {
      node.children = {};
    }

    if (key in node.children) {
      throw new Error(
        `Could not add child group "${key}" at ${JSON.stringify(
          loc
        )}: Name exists`
      );
    }

    node.children[key] = [];

    return new SyntaxTree(newDescription);
  }

  /**
   * Searches for all nodes of a specific type that are part of this tree.
   *
   * @return An array of nodes that match the given type.
   */
  getNodesOfType(typename: QualifiedTypeName): SyntaxNode[] {
    if (this.isEmpty) {
      return [];
    } else {
      return this._root.getNodesOfType(typename);
    }
  }
}
