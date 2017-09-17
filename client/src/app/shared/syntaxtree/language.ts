import { LanguageDescription } from './language.description'

import { Node, NodeDescription } from './syntaxtree'
import { Validator, ValidationResult } from './validator'
import { CodeGenerator } from './codegenerator'

/**
 * A facade that ties together everything the editor needs to work with a language.
 */
export class Language {
  private _validator: Validator;
  private _codeGenerator: CodeGenerator;
  private _name: string;

  constructor(desc: LanguageDescription) {
    this._name = desc.name;
    this._codeGenerator = new CodeGenerator(desc.generators);
    this._validator = new Validator(desc.validators);
  }

  /**
   * Instanciate a tree from its description.
   *
   * @param desc The description of the tree
   * @return The root node for the described tree
   */
  createTree(desc: NodeDescription): Node {
    return (new Node(desc, undefined));
  }

  /**
   * Validates a syntax tree against this language.
   *
   * @param ast The root of the tree to validate
   * @return A result object containing all errors
   */
  validateTree(ast: Node): ValidationResult {
    return (this._validator.validateFromRoot(ast));
  }

  /**
   * Emits the "stringified" version of the given tree.
   *
   * @param ast The root of the tree to generate
   * @return A string representation of the tree.
   */
  emitTree(ast: Node): string {
    return (this._codeGenerator.emit(ast));
  }

}
