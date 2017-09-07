import * as Desc from './validator.description'
import * as AST from './syntaxtree'

// Groups together all error codes that exist in the core of the validator.
export enum ErrorCodes {
  // The AST does simply not exist at all
  Empty = "EMPTY",
  // A AST has a root node that does not match any allowed root node
  UnknownRoot = "UNKNOWN_ROOT",
  // A different type was explicitly expected
  UnexpectedType = "UNEXPECTED_TYPE",
  // A child was expected, but simply did not exist
  MissingChild = "MISSING_CHILD",
  // A property was expected, but simply did not exist
  MissingProperty = "MISSING_PROPERTY",
  // A child was present, but somehow it's type wasn't asked for
  IllegalPropertyType = "ILLEGAL_PROPERTY_TYPE",
  // A property was present, but breached a restriction
  IllegalChildType = "ILLEGAL_CHILD_TYPE",
  // A type mentions a child category that is not present in a node
  SuperflousChildCategory = "SUPERFLOUS_CHILD_CATEGORY",
}

export interface ErrorUnexpectedType {
  present: AST.QualifiedTypeName
  expected: AST.QualifiedTypeName
}

export interface ErrorIllegalChildType {
  present: AST.QualifiedTypeName,
  index: number
}

export interface ErrorMissingChild {
  expected: AST.QualifiedTypeName,
  index: number
}

export interface ErrorMissingProperty {
  expected: string
  name: string
}

// Details about an unknown child category
export interface ErrorUnknownChildCategory {
  categoryName: string;
}

export type ErrorData =
  ErrorUnexpectedType |
  ErrorUnknownChildCategory |
  ErrorMissingChild |
  ErrorMissingProperty |
  any;

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
 * Describes a complex node that may have any kind of children.
 */
class NodeType {
  private _languageName: string;
  private _typeName: string;

  private _allowedChildren: { [category: string]: NodeTypeChildren } = {};
  private _allowedProperties: { [propName: string]: NodePropertyValidator } = {};
  private _validator: Validator;

  constructor(validator: Validator, typeDesc: Desc.NodeTypeDescription, language: string, name: string) {
    this._typeName = name;
    this._languageName = language;
    this._validator = validator;

    // Construct validators for all children
    const childrenCategories = typeDesc.children || {};
    Object.entries(childrenCategories).forEach(([groupName, groupDesc]) => {
      this._allowedChildren[groupName] = new NodeTypeChildren(this, groupDesc, groupName);
    });

    // Construct validators for all properties
    const properties = typeDesc.properties || {};
    Object.entries(properties).forEach(([propName, propDesc]) => {
      this._allowedProperties[propName] = this.instanciatePropertyValidator(propDesc)
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

  /**
   * Validates this node itself and all existing children.
   */
  private validateImpl(ast: AST.Node, context: ValidationContext) {
    // Check all required children
    this.requiredChildrenCategories.forEach(categoryName => {
      const catChildren = ast.getChildrenInCategory(categoryName);
      this._allowedChildren[categoryName].validate(catChildren, context);
    });

    // Check that there are no unwanted children
    const requiredCategories = new Set(this.requiredChildrenCategories);
    const superflousCategories = ast.childrenCategoryNames.filter(cat => !requiredCategories.has(cat));
    superflousCategories.forEach(categoryName => {
      context.addError(ErrorCodes.SuperflousChildCategory, ast, {
        categoryName: categoryName
      });
    });

    // Check all required properties
    Object.entries(this._allowedProperties).forEach(([name, validator]) => {
      if (name in ast.nodeProperties) {
        const value = ast.nodeProperties[name];
        validator.validate(ast, value, context);
      } else {
        context.addError(ErrorCodes.MissingProperty, ast, {
          expected: validator.base,
          name: name
        } as ErrorMissingProperty);
      }
    });
  }

  /**
   * @return A NodePropertyValidator that validates the correct type.
   */
  private instanciatePropertyValidator(desc: Desc.NodePropertyDescription): NodePropertyValidator {
    if (Desc.isNodePropertyStringDesciption(desc)) {
      return (new NodePropertyStringValidator(desc));
    } else {
      throw new Error(`Unknown property validator for base "${desc.base}"`);
    }
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

  /**
   * @return The fully qualified typename this validator expects.
   */
  get qualifiedName(): AST.QualifiedTypeName {
    return ({
      languageName: this._languageName,
      typeName: this._typeName
    });
  }

  /**
   * @return Names of all categories that should have children.
   */
  get requiredChildrenCategories() {
    return (Object.keys(this._allowedChildren));
  }

  /**
   * @return The validator this node is associated with.
   */
  get validator() {
    return (this._validator);
  }
}

/**
 * Validates children of a complex type.
 */
class NodeTypeChildren {
  private _categoryName: string;
  private _childValidator: NodeComplexTypeChildrenValidator;
  private _parent: NodeType;

  constructor(parent: NodeType, desc: Desc.NodeTypeChildrenGroupDescription, name: string) {
    this._categoryName = name;
    this._parent = parent;

    if (Desc.isNodeTypesSequenceDescription(desc)) {
      this._childValidator = new NodeComplexTypeChildrenSequence(parent, desc);
    } else if (Desc.isNodeTypesAllowedDescription(desc)) {
      this._childValidator = new NodeComplexTypeChildrenAllowed(parent, desc);
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
    validChildren.forEach(child => {
      const childType = this._parent.validator.getType(child.nodeLanguage, child.nodeName);
      childType.validate(child, context);
    });
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
  private _nodeTypes: TypeReference[];

  constructor(parent: NodeType, desc: Desc.NodeTypesSequenceDescription) {
    this._nodeTypes = desc.nodeTypes.map(typeDesc => new TypeReference(parent.validator, typeDesc, parent.languageName));
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
        if (expected.nodeTypeMatches(child)) {
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
          expected: expected.description,
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
  private _nodeTypes: TypeReference[];

  constructor(parent: NodeType, desc: Desc.NodeTypesAllowedDescription) {
    this._nodeTypes = desc.nodeTypes.map(typeDesc => new TypeReference(parent.validator, typeDesc, parent.languageName));
  }

  /**
   * Ensures that every child has at least a matching type.
   */
  validateChildren(children: AST.Node[], context: ValidationContext) {
    const toReturn: AST.Node[] = [];

    children.forEach(node => {
      if (!this._nodeTypes.find(type => type.nodeTypeMatches(node))) {
        context.addError(ErrorCodes.IllegalChildType, node);
      } else {
        toReturn.push(node);
      }
    });

    return (toReturn);
  }
}

/**
 * Validates any property.
 */
interface NodePropertyValidator {
  validate(node: AST.Node, value: string, context: ValidationContext): void;

  // The basic type of this property
  base: string;
}

/**
 * Validates properties that are meant to be strings.
 */
class NodePropertyStringValidator implements NodePropertyValidator {
  private _restrictions: Desc.NodeStringTypeRestrictions[] = [];

  constructor(desc: Desc.NodePropertyStringDescription) {
    if (desc.restrictions) {
      this._restrictions = desc.restrictions;
    }
  }

  get base() {
    return "string";
  }

  validate(node: AST.Node, value: string, context: ValidationContext) {
    this._restrictions.forEach(restriction => {
      switch (restriction.type as string) {
        case "length":
          if (value.length != restriction.value) {
            context.addError(ErrorCodes.IllegalPropertyType, node, {
              condition: `${value.length} != ${restriction.value}`
            })
          }
          break;
        case "minLength":
          if (value.length < restriction.value) {
            context.addError(ErrorCodes.IllegalPropertyType, node, {
              condition: `${value.length} < ${restriction.value}`
            })
          }
          break;
        case "maxLength":
          if (value.length > restriction.value) {
            context.addError(ErrorCodes.IllegalPropertyType, node, {
              condition: `${value.length} > ${restriction.value}`
            })
          }
          break;
        default:
          throw new Error(`Unknown string restriction: "${restriction.type}"`);
      }
    });
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

  /**
   * @param validator Used when attempting to resolve this type.
   * @param desc The reference in qualified or unqualified form
   * @param currentLang The language to use in case of an unqualified reference
   */
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
   * @return True, if the given node has the same language and the same typename.
   */
  nodeTypeMatches(node: AST.Node) {
    return (this._languageName == node.nodeLanguage && this._typeName == node.nodeName);
  }

  /**
   * @return True if this reference can be resolved to a "proper" type.
   */
  get isResolveable() {
    return (this._validator.isKnownType(this._languageName, this._typeName));
  }

  /**
   * @return The actual underlying type this reference resolves to. Throws an exception
   *         if the type is not known.
   */
  get type() {
    if (!this.isResolveable) {
      throw new Error(`Could not resolve type "${this._languageName}.${this._typeName}"`);
    } else {
      return (this._validator.getType(this._languageName, this._typeName));
    }
  }

  /**
   * @return The description that is equivalent to this reference.
   */
  get description(): AST.QualifiedTypeName {
    return ({
      languageName: this._languageName,
      typeName: this._typeName
    });
  }
}

/**
 * A language consists of type definitions and a set of types that may occur at the root.
 */
class LanguageValidator {
  private _validator: Validator;
  private _languageName: string;
  private _registeredTypes: { [name: string]: NodeType } = {};
  private _rootTypes: TypeReference[] = [];

  constructor(validator: Validator, desc: Desc.LanguageDescription) {
    this._validator = validator;
    this._languageName = desc.languageName;

    Object.entries(desc.types).forEach(([typeName, typeDesc]) => {
      this.registerTypeValidator(typeName, typeDesc)
    });

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
   * @return The validator this language has been registered to.
   */
  get validator() {
    return (this._validator);
  }

  /**
   * Registers a new type validator with this language.
   */
  private registerTypeValidator(nodeName: string, desc: Desc.NodeTypeDescription) {
    if (this.isKnownType(nodeName)) {
      throw new Error(`Attempted to register node "${nodeName}" twice for "${this._languageName}. Previous definition: ${JSON.stringify(this._registeredTypes[nodeName])}, Conflicting Definition: ${JSON.stringify(desc)}`);
    }

    this._registeredTypes[nodeName] = new NodeType(this._validator, desc, this._languageName, nodeName);
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
  private _registeredLanguages: { [langName: string]: LanguageValidator } = {};

  constructor(langs: Desc.LanguageDescription[]) {
    langs.forEach(langDesc => this.registerLanguage(langDesc));
  }

  /**
   * Registers a new language with this validator
   */
  private registerLanguage(desc: Desc.LanguageDescription) {
    if (this.isKnownLanguage(desc.languageName)) {
      throw new Error(`Attempted to register language "${desc.languageName}" twice`);
    }

    this._registeredLanguages[desc.languageName] = new LanguageValidator(this, desc);
  }

  /**
   * @param ast The root of the AST to validate
   * @return All errors that occured during evaluation
   */
  validateFromRoot(ast: AST.Node) {
    const context = new ValidationContext();

    if (ast) {
      // Pass validation to the appropriate language
      const lang = this.getLanguage(ast.nodeLanguage);
      lang.validateFromRoot(ast, context);
    } else {
      // Not having a document is a single error
      context.addError(ErrorCodes.Empty, undefined);
    }

    return (new ValidationResult(context));
  }

  /**
   * @return The langauge that has been asked for. Throws if the language does not exist.
   */
  getLanguage(language: string) {
    if (!this.isKnownLanguage(language)) {
      throw new Error(`Validator does not know language "${language}"`);
    } else {
      return (this._registeredLanguages[language]);
    }
  }

  /**
   * @return The type that has been asked for. Throws if the type does not exist.
   */
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
