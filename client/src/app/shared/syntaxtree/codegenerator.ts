import { Node, QualifiedTypeName } from './syntaxtree'

/**
 * Represents a node that has been compiled into its string
 * representation.
 */
interface GeneratedNode {
  depth: number;
  compilation: string;
  node: Node;
}

/**
 * Bundles data that is collected during code generation.
 */
export class CodeGeneratorProcess {
  private _generated: GeneratedNode[] = [];
  private _generator: CodeGenerator;

  constructor(generator: CodeGenerator) {
    this._generator = generator;
  }

  /**
   * Adds some compiled node to the current result.
   */
  addConvertedNode(depth: number, compilation: string, node: Node) {
    this._generated.push({
      depth: depth,
      compilation: compilation,
      node: node
    });
  }

  generateNode(node: Node, depthChange = 0) {
    const converter = this._generator.getConverter(node.qualifiedName);
    const bodyCategories = converter.init(node, this) || node.childrenCategoryNames;

    // Iterate over all children that should be emitted
    bodyCategories.forEach(categoryName => {
      node.getChildrenInCategory(categoryName).forEach(child => {
        this.generateNode(child, 0)
      });
    });

    // Possibly finish generation
    if (converter.finish) {
      converter.finish(node, this);
    }
  }

  emit(): string {
    return (this._generated.map(g => g.compilation).join("\n"));
  }
}

/**
 * Controls how a node is converted to text and what the children
 * have to do with it. 
 */
export interface NodeConverter {
  /*
   * This function is called when the node is entered. Because
   * languages like XML need to render some special children,
   * namingly their attributes, before the actual children, some
   * children may be rendered as part of this step. To ensure
   * that these children are not re-rendered as part of the body,
   * this function should explicitly return the children to render
   * as part of the body.
   *
   * @return A list of categories. The categories in this list
   *         will be processed as part of the body of this node.
   *         If the return value is `undefined` all children
   *         will be processed as part of the body.
   */
  init(node: Node, process: CodeGeneratorProcess): (string[] | void);

  /**
   * A possibility to close any unfinished business from the
   * init-function.
   */
  finish?: (node: Node, process: CodeGeneratorProcess) => void;

}

/**
 * Used to register a NodeConverter for a certain type.
 */
export interface NodeConverterRegistration {
  converter: NodeConverter,
  type: QualifiedTypeName
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

  constructor(converters: NodeConverterRegistration[]) {
    converters.forEach(c => this.registerConverter(c.type, c.converter));
  }

  registerConverter(t: QualifiedTypeName, converter: NodeConverter) {
    if (this.hasConverter(t)) {
      throw new Error(`There is already a converter for ${"${t.languageName}.${t.typeName}"}`);
    } else {
      if (!this._callbacks[t.languageName]) {
        this._callbacks[t.languageName] = {};
      }
      this._callbacks[t.languageName][t.typeName] = converter;
    }
  }

  /**
   * @param ast The tree to emit.
   */
  emit(ast: Node): string {
    const process = new CodeGeneratorProcess(this);
    process.generateNode(ast, 0);

    return (process.emit());
  }

  /**
   * @return True if there is a converter for the given type.
   */
  hasConverter(t: QualifiedTypeName) {
    return !!(this._callbacks[t.languageName] && this._callbacks[t.languageName][t.typeName]);
  }

  /**
   * @return A converter for the type in question.
   */
  getConverter(t: QualifiedTypeName) {
    if (!this._callbacks[t.languageName]) {
      throw new Error(`Language "${t.languageName}" is unknown to CodeGenerator`);
    }

    if (!this._callbacks[t.languageName][t.typeName]) {
      throw new Error(`Type "${t.languageName}.${t.typeName}" is unknown to CodeGenerator`);
    }

    return (this._callbacks[t.languageName][t.typeName]);
  }

}
