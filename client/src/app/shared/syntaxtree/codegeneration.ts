import { Node } from './syntaxtree'

type Emit = (node: Node) => string
type NodeConverter = { enter: Emit, leave?: Emit }
type RegisteredCallbacks = { [langName: string]: { [langName: string]: NodeConverter } };

/**
 * Transforms an AST into its compiled string representation.
 */
export class CodeGenerator {

  private _callbacks: RegisteredCallbacks = {};

  emit(ast: Node): string {
    const converter = this._callbacks[ast.nodeLanguage][ast.nodeName];

    return (converter.enter(ast) + converter.leave(ast));
  }

}
