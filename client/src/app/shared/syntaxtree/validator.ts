import * as Desc from './validator.description'
import * as AST from './syntaxtree'

export type ErrorCodes = "UNKNOWN_ROOT"

export interface ValidationItem {
  type: "error" | "warning"
  message: string
}

/**
 * Represents the result of a completed validation.
 */
export class ValidationResult {

}

interface ValidationError {
  code: string;
  node: AST.Node;
}

/**
 * Used during validation to accumulate validation results.
 */
class ValidationContext {
  private _errors: ValidationError[] = [];

  addError(code: ErrorCodes | string, node: AST.Node) {
    this._errors.push({ code: code, node: node });
  }
}

/**
 * Base class for types describing simple and complex nodes. Derived
 * instances of this class are registered as part of a schema.
 */
abstract class NodeType {
  private _familyName: string;
  private _typeName: string;

  constructor(typeDesc: Desc.NodeTypeDescription, language: string) {
    this._typeName = typeDesc.nodeName;
    this._familyName = language;
  }

  /**
   * @return The name of the language this type belongs to.
   */
  get languageName() {
    return (this._familyName);
  }

  /**
   * @return The type of node this instance will validate.
   */
  get typeName() {
    return (this._typeName);
  }

  validate(ast: AST.Node, context: ValidationContext) {
    if (this._familyName == ast.nodeFamily && this._typeName == ast.nodeName) {
      context.addError("UNEXPECTED_NODE", ast);
    } else {
      this.validateImpl(ast, context);
    }
  }

  abstract validateImpl(ast: AST.Node, context: ValidationContext);
}

/**
 * Describes a complex node that may have any kind of children.
 */
class NodeComplexType extends NodeType {
  private _allowedChildren: NodeComplexTypeChildren[] = [];

  constructor(typeDesc: Desc.NodeTypeDescription, familyName: string) {
    super(typeDesc, familyName)
  }

  validateImpl(ast: AST.Node, context: ValidationContext) {

  }
}

/**
 * Validates children of a complex type.
 */
class NodeComplexTypeChildren {
  private _categoryName: string;

  private _childValidator: NodeComplexTypeChildrenSequence;

  constructor(desc: Desc.NodeComplexTypeChildrenGroupDescription) {
    this._categoryName = desc.categoryName;
    this._childValidator = new NodeComplexTypeChildrenSequence(desc.children as Desc.NodeTypesSequenceDescription);
  }
}

class NodeComplexTypeChildrenSequence {
  private _nodeTypes: string[];

  constructor(desc: Desc.NodeTypesSequenceDescription) {
    this._nodeTypes = desc.nodeTypes;
  }
}

class TypeReference {
  private _languageName: string;
  private _typeName: string;
  private _validator: Validator;

  constructor(_validator: Validator, desc: Desc.TypeReference, currentLang: string) {
    this._validator = _validator;

    if (Desc.isQualifiedTypeReference(desc)) {
      this._languageName = desc.languageName;
      this._typeName = desc.typeName;
    } else {
      this._languageName = currentLang;
      this._typeName = desc;
    }
  }

  /**
   * @return True if this reference can be resolved to a "proper" type.
   */
  get isResolveable() {
    return (this._validator.isKnownType(this._languageName, this._typeName));
  }

  get type() {
    if (!this.isResolveable) {
      throw new Error(`Could not resolve type "${this._languageName}.${this._typeName}"`);
    } else {
      return (this._validator.getType(this._languageName, this._typeName));
    }
  }
}

/**
 * A language consists of type definitions and a set of types that may occur at the root.
 */
class Language {
  private _validator: Validator;
  private _languageName: string;
  private _registeredTypes: { [name: string]: NodeComplexType } = {};
  private _rootTypes: TypeReference[] = [];

  constructor(validator: Validator, desc: Desc.LanguageDescription) {
    this._validator = validator;
    this._languageName = desc.languageName;

    desc.root.forEach(rootRef => desc.types.forEach(typeDesc => this.registerTypeValidator(typeDesc)));
  }

  validateFromRoot(ast: AST.Node, context: ValidationContext) {
    const rootType = this._rootTypes.find(rootRef => rootRef.type.typeName == ast.nodeName);

    if (!rootType) {
      context.addError("UNKNOWN_ROOT", ast);
    }

    rootType.type.validate(ast, context);
  }

  /**
   * @return True if the given typename is known in this language.
   */
  isKnownType(typename: string) {
    return (!!this._registeredTypes[typename]);
  }

  getType(typename: string) {
    if (!this.isKnownType(typename)) {
      throw new Error(`Language "${this._languageName}" does not have type "${typename}"`);
    } else {
      return (this._registeredTypes[typename]);
    }
  }

  /**
   * Registers a new type validator with this language.
   */
  private registerTypeValidator(desc: Desc.NodeTypeDescription) {
    if (this.isKnownType(desc.nodeName)) {
      throw new Error(`Attempted to register node "${desc.nodeName}" twice for "${this._languageName}"`);
    }

    this._registeredTypes[desc.nodeName] = new NodeComplexType(desc, this._languageName);
  }

  /**
   * Registers a new possible root with this language.
   */
  private registerRootReference(desc: Desc.TypeReference) {
    this._rootTypes.push(new TypeReference(this._validator, desc, this._languageName));
  }
}

/**
 * A validator receives instances of one or multiple schemas and will
 * check any AST against those languages.
 */
export class Validator {
  private _registeredLanguages: { [langName: string]: Language } = {};

  constructor(langs: Desc.LanguageDescription[]) {
    langs.forEach(langDesc => this.registerLanguage(langDesc));
  }

  registerLanguage(desc: Desc.LanguageDescription) {
    if (this.isKnownLanguage(desc.languageName)) {
      throw new Error(`Attempted to register language "${desc.languageName}" twice`);
    }

    this._registeredLanguages[desc.languageName] = new Language(this, desc);
  }

  validateFromRoot(ast: AST.Node) {
    const lang = this.getLanguage(ast.nodeFamily);
    const result = new ValidationContext();

    lang.validateFromRoot(ast, result);

    return (result);
  }

  getLanguage(language: string) {
    if (!this.isKnownLanguage(language)) {
      throw new Error(`Validator does not know language "${language}"`);
    } else {
      return (this._registeredLanguages[language]);
    }
  }

  getType(language: string, typename: string) {
    if (!this.isKnownType(language, typename)) {
      throw new Error(`Validator does not know type "${language}.${typename}"`);
    } else {
      return (this._registeredLanguages[language].getType(typename));
    }
  }

  /**
   * @return True if the given language is known to this validator.
   */
  isKnownLanguage(language: string) {
    return (!!this._registeredLanguages[language]);
  }

  /**
   * @return True if the given typename is known in the given language.
   */
  isKnownType(language: string, typename: string) {
    return (
      this.isKnownLanguage(language) &&
      this._registeredLanguages[language].isKnownType(typename)
    );
  }
}
