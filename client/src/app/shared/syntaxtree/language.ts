import { NodeConverterRegistration } from "./codegenerator";
import { Tree, NodeDescription, QualifiedTypeName } from "./syntaxtree";
import { Validator, SubValidator } from "./validator";
import { ValidationResult } from "./validation-result";
import { CodeGenerator } from "./codegenerator";
import { GrammarDescription } from "./grammar.description";

/**
 * Ties together descriptions of everything the editor needs to work
 * with a language.
 */
export interface LanguageDefinition {
  id: string;
  name: string;
  validators: SubValidator[];
  emitters: NodeConverterRegistration[];
  codeGeneratorState?: any[];
}

/**
 * A facade that ties together everything the editor needs to work with a language.
 */
export class Language {
  private _id: string;
  private _name: string;

  private _validator: Validator;
  private _codeGenerator: CodeGenerator;

  constructor(desc: LanguageDefinition) {
    this._id = desc.id;
    this._name = desc.name;
    this._codeGenerator = new CodeGenerator(
      desc.emitters,
      desc.codeGeneratorState
    );
    this._validator = new Validator(desc.validators);
  }

  /**
   * @return The unique ID of this language
   */
  get id() {
    return this._id;
  }

  /**
   * @return The name of this language.
   */
  get name() {
    return this._name;
  }

  /**
   * @return The validator that is assoicated with this language
   */
  get validator() {
    return this._validator;
  }

  /**
   * A new language that uses the exact same custom code assets (code
   * generator, additional validators) but a different grammar.
   */
  cloneWithAlternateGrammar(g: GrammarDescription) {
    // Construct a new language (without the emitters, they need to be patched in later)
    const clone = new Language({
      id: g.id,
      name: this.name,
      emitters: [],
      validators: [...this._validator.specializedValidators, g],
    });

    // Patch in the emitters
    clone._codeGenerator = this._codeGenerator;

    return clone;
  }

  /**
   * @return The type with the given name.
   */
  getType(typeName: QualifiedTypeName) {
    return this._validator.getType(typeName.languageName, typeName.typeName);
  }

  /**
   * Instanciate a tree from its description.
   *
   * @param desc The description of the tree
   * @return The described tree
   */
  createTree(desc: NodeDescription): Tree {
    return new Tree(desc);
  }

  /**
   * Validates a syntax tree against this language.
   *
   * @param ast The root of the tree to validate
   * @param additionalContext
   *   Additional data that may be required by specialized validators. Prime example
   *   is the SQL validator which requires knowledge about the schema.
   * @return A result object containing all errors
   */
  validateTree(ast: Tree, additionalContext: any = {}): ValidationResult {
    return this._validator.validateFromRoot(ast, additionalContext);
  }

  /**
   * Emits the "stringified" version of the given tree.
   *
   * @param ast The root of the tree to generate
   * @return A string representation of the tree.
   */
  emitTree(ast: Tree): string {
    return this._codeGenerator.emit(ast);
  }

  /**
   * @return The validators that are available for this language.
   */
  get availableValidators() {
    return this._validator.availableSchemas;
  }

  /**
   * @return All types that are available in this language.
   */
  get availableTypes() {
    return this._validator.availableTypes;
  }
}
