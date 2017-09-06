import { Node } from './syntaxtree'

interface RenderedChildren {
  categories: { [categoryName: string]: string[] };
}

/**
 * Controls how a node is converted to text. Because the children
 * may be more or less complexly involved in the process there are
 * quite a few callbacks available.
 */
interface NodeConverter {
  /*
   * This function is called when the node is entered. Because
   * languages like XML need to render some special children,
   * namingly their attributes, before the actual children, some
   * pre-rendered children may be passed to this function.
   */
  init: (node: Node) => string;

  /**
   * The names of the categories that need to be passed into the
   * init callback.
   */
  initRecurse?: string[]

  childrenRecurse?: string[]

  finish?: (node: Node) => string;

}

/**
 * Registers callbacks per language per type.
 */
type RegisteredCallbacks = { [langName: string]: { [typeName: string]: NodeConverter } };

/**
 * Transforms an AST into its compiled string representation.
 */
export class CodeGenerator {

  private _callbacks: RegisteredCallbacks = {};

  emit(ast: Node): string {
    return (this.emitImpl(ast, 0));
  }

  private emitImpl(ast: Node, depth: number) {
    const converter = this._callbacks[ast.nodeLanguage][ast.nodeName];

    let toReturn = converter.init(ast);

    // Iterate over all groups
    Object.entries(ast.children).forEach(([groupName, group]) => {
      // And over all actual children
    });

    toReturn += converter.finish(ast);

    return (toReturn);
  }

}
