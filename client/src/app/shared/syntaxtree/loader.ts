import { Node, NodeDescription } from './syntaxtree'

/**
 * These functions know which specific classes need to be instantiated
 * when confronted with a node description.
 */
export type LoaderFunc = (desc: NodeDescription, parent: Node) => Node;

/**
 * This class is able to turn description of syntax trees into their
 * aquivalent runtime representation. As different kinds of syntaxtrees
 * may be more or less freely mixed every instance of this loader carries
 * some kind of registry for loading functions.
 */
export class SyntaxTreeLoader {
  private _loaders: { [name: string]: LoaderFunc } = {}

  /**
   * Register a new loading function with this loader.
   */
  registerLoader(name: string, func: LoaderFunc) {
    this._loaders[name] = func;
  }

  /**
   * 
   */
  loadNode(desc: NodeDescription, parent: Node) {
    // Grab the correct loading function from the registry and use it to
    // instanciate the node itself.
    const loaderFunc = this._loaders[desc.nodeLoader];
    const node = loaderFunc(desc, parent);

    // Load all children in all categories
    for (let categoryName in desc.nodeChildren) {
      const category = desc.nodeChildren[categoryName];
      node.nodeChildren[categoryName] = category.map(childDesc => this.loadNode(childDesc, node))
    }

    return node;
  }
}
