import * as Desc from './validator.description'
import * as AST from './syntaxtree'

export enum ErrorCodes {
  // A AST has a root node that does not match any allowed root node
  UnknownRoot = "UNKNOWN_ROOT",
  // A different type was explicitly expected
  UnexpectedType = "UNEXPECTED_TYPE",
  // A child was expected, but simply did not exist
  MissingChild = "MISSING_CHILD",
  // A child was present, but somehow it's type wasn't asked for
  IllegalChildType = "ILLEGAL_CHILD_TYPE",
  // A type mentions a child category that is not present in a node
  SuperflousChildCategory = "MISSING_CHILD_CATEGORY",
}

export interface ErrorUnexpectedType {
  present: Desc.QualifiedTypeName
  expected: Desc.QualifiedTypeName
}

export interface ErrorIllegalChildType {
  present: Desc.QualifiedTypeName,
  index: number
}

export interface ErrorMissingChild {
  expected: Desc.QualifiedTypeName,
  index: number
}

// Details about an unknown child category
export interface ErrorUnknownChildCategory {
  categoryName: string;
}

export type ErrorData = ErrorUnexpectedType | ErrorUnknownChildCategory | any;

interface ValidationError {
  code: string;
  node: AST.Node;
  data?: ErrorData;
}

/**
 * Used during validation to accumulate validation results.
 */
class ValidationContext {
  private _errors: ValidationError[] = [];

  addError(code: ErrorCodes | string, node: AST.Node, data: ErrorData = undefined) {
    this._errors.push({ code: code, node: node, data: data });
  }

  get errors() {
    return (this._errors);
  }
}

/**
 * Represents the result of a completed validation.
 */
export class ValidationResult {
  private _errors: ValidationError[];

  constructor(context: ValidationContext) {
    this._errors = context.errors;
  }

  get isValid() {
    return (this._errors.length === 0);
  }

  get errors() {
    return (this._errors);
  }
}


/**
 * Base class for types describing simple and complex nodes. Derived
 * instances of this class are registered as part of a schema.
 */
abstract class NodeType {
  private _languageName: string;
  private _typeName: string;

  constructor(typeDesc: Desc.NodeTypeDescription, language: string) {
    this._typeName = typeDesc.nodeName;
    this._languageName = language;
  }

  /**
   * @return The name of the language this type belongs to.
   */
  get languageName() {
    return (this._languageName);
  }

  /**
   * @return The type of node this instance will validate.
   */
  get typeName() {
    return (this._typeName);
  }

  get qualifiedName(): Desc.QualifiedTypeName {
    return ({
      languageName: this._languageName,
      typeName: this._typeName
    });
  }

  /**
   * Validates this node and (if applicable) it's children
   * and other properties.
   */
  validate(ast: AST.Node, context: ValidationContext) {
    // Does the type of the given node match the type we expect?
    if (this._languageName == ast.nodeLanguage && this._typeName == ast.nodeName) {
      // Further validation is done by specific implementations
      this.validateImpl(ast, context);
    } else {
      // Skip any further validation, leave an error
      context.addError(ErrorCodes.UnexpectedType, ast, {
        expected: this.qualifiedName,
        present: ast.qualifiedName
      } as ErrorUnexpectedType);
    }
  }

  abstract validateImpl(ast: AST.Node, context: ValidationContext);
}

/**
 * Describes a complex node that may have any kind of children.
 */
class NodeComplexType extends NodeType {
  private _allowedChildren: { [category: string]: NodeComplexTypeChildren } = {};

  constructor(typeDesc: Desc.NodeTypeDescription, familyName: string) {
    super(typeDesc, familyName)

    if (Desc.isNodeComplexTypeDescription(typeDesc)) {
      // Construct validators for all children
      const childrenCategories = typeDesc.childrenCategories || [];
      childrenCategories.forEach(groupDesc => {
        this._allowedChildren[groupDesc.categoryName] = new NodeComplexTypeChildren(groupDesc);
      });
    } else {
      throw new Error("Wrong type description: Not complex");
    }
  }

  /**
   * Validates this node itself and all existing children.
   */
  validateImpl(ast: AST.Node, context: ValidationContext) {
    // Check all required children
    this.requiredChildren.forEach(categoryName => {
      const catChildren = ast.getChildrenInCategory(categoryName);
      this._allowedChildren[categoryName].validate(catChildren, context);
    });

    // Check that there are now unwanted children
    const requiredCategories = new Set(this.requiredChildren);
    const superflousCategories = ast.childrenCategoryNames.filter(cat => requiredCategories.has(cat));
    superflousCategories.forEach(categoryName => {
      context.addError(ErrorCodes.SuperflousChildCategory, ast, {
        categoryName: categoryName
      });
    });
  }

  get requiredChildren() {
    return (Object.keys(this._allowedChildren));
  }
}

/**
 * Validates children of a complex type.
 */
class NodeComplexTypeChildren {
  private _categoryName: string;

  private _childValidator: NodeComplexTypeChildrenValidator;

  constructor(desc: Desc.NodeComplexTypeChildrenGroupDescription) {
    this._categoryName = desc.categoryName;

    const validatorDesc = desc.children;
    if (Desc.isNodeTypesSequenceDescription(validatorDesc)) {
      this._childValidator = new NodeComplexTypeChildrenSequence(validatorDesc);
    } else if (Desc.isNodeTypesAllowedDescription(validatorDesc)) {
      this._childValidator = new NodeComplexTypeChildrenAllowed(validatorDesc);
    } else {
      throw new Error(`Unknown child validator: "${JSON.stringify(desc)}"`);
    }
  }

  /**
   * Checks the children of this group.
   */
  validate(ast: AST.Node[], context: ValidationContext) {
    // Check the top-level structure of the children
    const validChildren = this._childValidator.validateChildren(ast, context);

    // Check the children themselves
  }
}


/**
 * Classes implementing this interface can check whether certain
 * child nodes are structurally valid.
 */
interface NodeComplexTypeChildrenValidator {
  /**
   * Checks whether the given children are in a legal position in the given
   * array. Adds errors to the context if children are in illegal positions.
   *
   * @return All children that are in valid positions and should be checked further.
   */
  validateChildren(ast: AST.Node[], context: ValidationContext): AST.Node[];
}

/**
 * Enforces a specific sequence of child-nodes of a parent node.
 */
class NodeComplexTypeChildrenSequence implements NodeComplexTypeChildrenValidator {
  private _nodeTypes: string[];

  constructor(desc: Desc.NodeTypesSequenceDescription) {
    this._nodeTypes = desc.nodeTypes;
  }

  /**
   * Ensures the sequence is correct
   */
  validateChildren(ast: AST.Node[], context: ValidationContext): AST.Node[] {
    const toReturn = [];
    let childIndex = 0;
    // Ensure that all types we are expecting are actually present
    this._nodeTypes.forEach(expected => {
      // Is a child actually present?
      const child = ast[childIndex];
      if (child) {
        // Yes, does it's type match?
        if (child.nodeName == expected) {
          // Sign up for further validation
          toReturn.push(ast[childIndex]);
        } else {
          // Hand out a (more or less) detailed error message
          context.addError(ErrorCodes.IllegalChildType, child, {
            present: child.qualifiedName,
            index: childIndex
          });
        }
      } else {
        // There is no child present, but the current type expects it
        context.addError(ErrorCodes.MissingChild, child, {
          expected: {
            languageName: "todo",
            typeName: expected
          },
          index: childIndex
        } as ErrorMissingChild);
      }

      // Go for the next child
      childIndex++;
    });

    return (toReturn);
  }
}

/**
 * Ensures that every child-node is of a type that has been explicitly
 * whitelisted.
 */
class NodeComplexTypeChildrenAllowed implements NodeComplexTypeChildrenValidator {
  private _nodeTypes: string[];

  constructor(desc: Desc.NodeTypesAllowedDescription) {
    this._nodeTypes = desc.nodeTypes;
  }

  /**
   * Ensures that every child has at least a matching type.
   */
  validateChildren(children: AST.Node[], context: ValidationContext) {
    const toReturn: AST.Node[] = [];

    children.forEach(node => {
      if (!this._nodeTypes.find(type => node.nodeName === type)) {
        context.addError(ErrorCodes.IllegalChildType, node);
      } else {
        toReturn.push(node);
      }
    });

    return (toReturn);
  }
}

/**
 * Types are usually not embedded, but referenced. This class is able
 * to resolve those references, even (or especially) if they cross
 * language boundaries.
 */
class TypeReference {
  private _languageName: string;
  private _typeName: string;
  private _validator: Validator;

  constructor(_validator: Validator, desc: Desc.TypeReference, currentLang: string) {
    this._validator = _validator;

    if (Desc.isQualifiedTypeName(desc)) {
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

    desc.types.forEach(typeDesc => this.registerTypeValidator(typeDesc));
    this._rootTypes = desc.root.map(rootDesc => new TypeReference(validator, rootDesc, this._languageName));
  }

  validateFromRoot(ast: AST.Node, context: ValidationContext) {
    const rootType = this._rootTypes.find(rootRef => rootRef.type.typeName == ast.nodeName);

    if (!rootType) {
      context.addError(ErrorCodes.UnknownRoot, ast);
    } else {
      rootType.type.validate(ast, context);
    }
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
      throw new Error(`Attempted to register node "${desc.nodeName}" twice for "${this._languageName}. Previous definition: ${JSON.stringify(this._registeredTypes[desc.nodeName])}, Conflicting Definition: ${JSON.stringify(desc)}`);
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
    const lang = this.getLanguage(ast.nodeLanguage);
    const context = new ValidationContext();

    lang.validateFromRoot(ast, context);

    return (new ValidationResult(context));
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
