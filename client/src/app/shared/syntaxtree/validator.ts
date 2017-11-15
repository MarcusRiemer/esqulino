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
  // A node with a transient type was detected
  TransientNode = "TRANSIENT_NODE",
  // A specifi child was expected, but simply did not exist
  MissingChild = "MISSING_CHILD",
  // A specific child was entirely unexpected
  SuperflousChild = "SUPERFLOUS_CHILD",
  // One or more children occur too often
  InvalidMaxOccurences = "INVALID_MAX_OCCURENCES",
  // One or more children occur not often enough
  InvalidMinOccurences = "INVALID_MIN_OCCURENCES",
  // A property was expected, but simply did not exist
  MissingProperty = "MISSING_PROPERTY",
  // A child was present, but somehow it's type wasn't asked for
  IllegalPropertyType = "ILLEGAL_PROPERTY_TYPE",
  // A property was present, but breached a restriction
  IllegalChildType = "ILLEGAL_CHILD_TYPE",
  // A type mentions a child category that is not present in a node
  SuperflousChildCategory = "SUPERFLOUS_CHILD_CATEGORY",
}

/**
 * Detailed data about an unexpected type. Shows the type that is present
 * and possibly the types that were originally expected.
 */
export interface ErrorUnexpectedType {
  present: AST.QualifiedTypeName
  expected: AST.QualifiedTypeName[]
}

/**
 * A child is not allowed in a certain position.
 */
export interface ErrorIllegalChildType {
  present: AST.QualifiedTypeName,
  index: number
}

export interface ErrorMissingChild {
  expected: AST.QualifiedTypeName,
  index: number,
  childrenCategory: string
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

/**
 * Core data about the error. In every case the user will be confronted with the
 * error code and the node location. The attached data may be used to to display
 * some helpful hints.
 */
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

  static EMPTY = new ValidationResult(new ValidationContext());

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
 * Every type can be identified by its fully qualified name (language
 * & name) and has access to the validator instance this concrete
 * type was loaded into.
 *
 * TODO: Possibly this should be handled by a dedicated UI layer?
 */
export abstract class NodeType {
  private _languageName: string;
  private _typeName: string;
  private _validator: Validator;

  constructor(validator: Validator, language: string, name: string) {
    this._typeName = name;
    this._languageName = language;
    this._validator = validator;
  }

  /**
   * Takes a node of an AST and validates the node itself and possibly
   * its children. Errors are collected in the given ValidationContext.
   *
   * @param ast The part of the tree that needs to be validated.
   * @param context Collects errors, hints, ... during validation.
   */
  abstract validate(ast: AST.Node, context: ValidationContext): void;

  /**
   * @return True if this instance could be used to validate something
   *         of the given type.
   */
  matchesType(typeName: AST.QualifiedTypeName) {
    return (this._languageName == typeName.languageName && this._typeName == typeName.typeName);
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
   * @return The validator this node is associated with.
   */
  get validator() {
    return (this._validator);
  }

  /**
   * @return The names of the categories that will be minimally required
   */
  abstract get requiredChildrenCategoryNames(): string[];
}

/**
 * Describes a complex node that may have any kind of children.
 */
class NodeConcreteType extends NodeType {

  private _allowedChildren: { [category: string]: NodeTypeChildren } = {};
  private _allowedProperties: { [propName: string]: NodePropertyValidator } = {};

  constructor(validator: Validator, typeDesc: Desc.NodeConcreteTypeDescription, language: string, name: string) {
    super(validator, language, name);

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
   * @return Names of all categories that could have children.
   */
  get allowedChildrenCategoryNames() {
    return (Object.keys(this._allowedChildren));
  }

  /**
   * @return The names of the categories that will be minimally required
   */
  get requiredChildrenCategoryNames() {
    return (
      Object.values(this._allowedChildren)
        .filter(c => c.isRequired)
        .map(c => c.categoryName)
    );
  }

  /**
   * Validates this node and (if applicable) it's children
   * and other properties.
   */
  validate(ast: AST.Node, context: ValidationContext) {
    // Does the type of the given node match the type we expect?
    if (this.languageName == ast.languageName && this.typeName == ast.typeName) {
      // Further validation is done by specific implementations
      this.validateImpl(ast, context);
    } else {
      // Skip any further validation, leave an error
      context.addError(ErrorCodes.UnexpectedType, ast, {
        expected: [this.qualifiedName],
        present: ast.qualifiedName
      } as ErrorUnexpectedType);
    }
  }

  /**
   * Validates this node itself and all existing children.
   */
  private validateImpl(ast: AST.Node, context: ValidationContext) {
    // Check all required children
    this.allowedChildrenCategoryNames.forEach(categoryName => {
      const catChildren = ast.getChildrenInCategory(categoryName);
      this._allowedChildren[categoryName].validate(ast, catChildren, context);
    });

    // Check that there are no unwanted children
    const requiredCategories = new Set(this.allowedChildrenCategoryNames);
    const superflousCategories = ast.childrenCategoryNames.filter(cat => !requiredCategories.has(cat));
    superflousCategories.forEach(categoryName => {
      context.addError(ErrorCodes.SuperflousChildCategory, ast, {
        categoryName: categoryName
      });
    });

    // Check all required properties
    Object.entries(this._allowedProperties).forEach(([name, validator]) => {
      if (name in ast.properties) {
        // Property exists on the node, time to validate it
        const value = ast.properties[name];
        validator.validate(ast, value, context);
      }
      // Property does not exist, is that a error?
      else if (!validator.isOptional) {
        context.addError(ErrorCodes.MissingProperty, ast, {
          expected: validator.baseName,
          name: name
        } as ErrorMissingProperty);
      }
    });
  }

  /**
   * @return A NodePropertyValidator that validates the correct type.
   */
  private instanciatePropertyValidator(desc: Desc.NodePropertyTypeDescription): NodePropertyValidator {
    if (Desc.isNodePropertyStringDesciption(desc)) {
      return (new NodePropertyStringValidator(desc));
    } else if (Desc.isNodePropertyBooleanDesciption(desc)) {
      return (new NodePropertyBooleanValidator(desc));
    } else {
      throw new Error(`Unknown property validator for base "${desc.base}"`);
    }
  }
}

/**
 * Validates children of a complex type.
 */
class NodeTypeChildren {
  private _categoryName: string;
  private _childValidator: NodeComplexTypeChildrenValidator;
  private _parent: NodeConcreteType;

  constructor(parent: NodeConcreteType, desc: Desc.NodeChildrenGroupDescription, name: string) {
    this._categoryName = name;
    this._parent = parent;

    if (Desc.isNodeTypesSequenceDescription(desc)) {
      this._childValidator = new NodeComplexTypeChildrenSequence(this, desc);
    } else if (Desc.isNodeTypesAllowedDescription(desc)) {
      this._childValidator = new NodeComplexTypeChildrenAllowed(this, desc);
    } else {
      throw new Error(`Unknown child validator: "${JSON.stringify(desc)}"`);
    }
  }

  /**
   * Checks the children of this group.
   */
  validate(parent: AST.Node, children: AST.Node[], context: ValidationContext) {
    // Check the top-level structure of the children
    const validChildren = this._childValidator.validateChildren(parent, children, context);

    // Check the children themselves
    validChildren.forEach(child => {
      const childType = this._parent.validator.getType(child.languageName, child.typeName);
      childType.validate(child, context);
    });
  }

  /**
   * @return True, if this child category is essential for the parent.
   */
  get isRequired() {
    return (this._childValidator.isRequired);
  }

  /**
   * @return The node that is the parent to all of these node.
   */
  get parent() {
    return (this._parent);
  }

  /**
   * @return The name of the category these children are attached to.
   */
  get categoryName() {
    return (this._categoryName);
  }
}


/**
 * Classes implementing this interface can check whether certain
 * child nodes are structurally valid.
 */
abstract class NodeComplexTypeChildrenValidator {
  // The number of children must be in these boundaries
  private _childCount: Desc.OccursDescription;

  constructor(desc: Desc.NodeTypesDescription) {
    if (!desc.childCount) {
      this._childCount = {
        minOccurs: 0,
        maxOccurs: +Infinity
      }
    } else {
      this._childCount = desc.childCount;
    }
  }

  /**
   * Checks whether the count of children is legal and then delegates
   * further checks to an implementation defined
   */
  validateChildren(parent: AST.Node, ast: AST.Node[], context: ValidationContext): AST.Node[] {
    if (ast.length < this._childCount.minOccurs) {
      context.addError(ErrorCodes.InvalidMinOccurences, parent);
    } else if (ast.length > this._childCount.maxOccurs) {
      context.addError(ErrorCodes.InvalidMaxOccurences, parent);
    }

    return (this.validateChildrenImpl(parent, ast, context));
  }

  /**
   * Checks whether the given children are in a legal position in the given
   * array. Adds errors to the context if children are in illegal positions.
   *
   * @return All children that are in valid positions and should be checked further.
   */
  protected abstract validateChildrenImpl(parent: AST.Node, ast: AST.Node[], context: ValidationContext): AST.Node[];

  /**
   * @return True, if this category will be required to be present on the node.
   */
  get isRequired() {
    return (this._childCount.minOccurs > 0 || this.isRequiredImpl);
  }

  /**
   * @return True, if the deriving implementation deems this category necessary.
   */
  protected abstract readonly isRequiredImpl: boolean;
}

/**
 * Describes bounds for the number of apperances a certain child may make.
 */
class ChildCardinality {
  private _nodeType: TypeReference;
  private _minOccurs: number;
  private _maxOccurs: number;

  constructor(typeDesc: Desc.NodeTypesChildReference, group: NodeTypeChildren, defaultLimits: Desc.OccursDescription) {
    const parent = group.parent;
    if (typeof (typeDesc) === "string") {
      // Simple strings per default occur exactly once
      this._nodeType = new TypeReference(parent.validator, typeDesc, parent.languageName);
      this._minOccurs = defaultLimits.minOccurs;
      this._maxOccurs = defaultLimits.maxOccurs;
    } else if (Desc.isChildCardinalityDescription(typeDesc)) {
      // Complex descriptions may provide different cardinalities
      this._nodeType = new TypeReference(parent.validator, typeDesc.nodeType, parent.languageName);
      this._minOccurs = typeDesc.minOccurs;
      this._maxOccurs = typeDesc.maxOccurs;
    } else {
      throw new Error(`Unknown sequence cardinality: "${JSON.stringify(typeDesc)}"`);
    }
  }

  /**
   * @return The type that is restricted in its cardinality.
   */
  get nodeType() {
    return (this._nodeType);
  }

  /**
   * @return The minimum number of occurences that are expected
   */
  get minOccurs() {
    return (this._minOccurs);
  }

  /**
   * @return The maximum number of occurences that are expected
   */
  get maxOccurs() {
    return (this._maxOccurs);
  }
}

/**
 * Enforces a specific sequence of child-nodes of a parent node.
 */
class NodeComplexTypeChildrenSequence extends NodeComplexTypeChildrenValidator {
  private _nodeTypes: ChildCardinality[];
  private _group: NodeTypeChildren;

  constructor(group: NodeTypeChildren, desc: Desc.NodeTypesSequenceDescription) {
    super(desc);
    const defaultLimit: Desc.OccursDescription = {
      minOccurs: 1,
      maxOccurs: 1,
    }

    this._group = group;
    this._nodeTypes = desc.nodeTypes.map(typeDesc => new ChildCardinality(typeDesc, group, defaultLimit));
  }

  /**
   * @return True, if any of the children in this group need to occur at least once.
   */
  get isRequiredImpl() {
    return (this._nodeTypes.some(c => c.minOccurs > 0));
  }

  /**
   * Ensures the sequence is correct
   */
  validateChildrenImpl(parent: AST.Node, children: AST.Node[], context: ValidationContext): AST.Node[] {
    // Valid children that should be checked more thorughly
    const toReturn = [];

    // Used to step through all children of `ast`
    let childIndex = 0;

    // Ensure that all types we are expecting are actually present
    this._nodeTypes.forEach(expected => {
      // This index starts counting for every type. It is used
      // to track whether minOccurences and maxOccurences are
      // satisfied or not.
      let subIndex = 0;

      // Try to "eat" as many children as possible
      while (subIndex < expected.maxOccurs) {

        // Is a child actually present?
        let child = children[childIndex];

        if (child) {
          // Yes, does it's type match?
          if (expected.nodeType.matchesType(child.qualifiedName)) {
            // Sign up for further validation
            toReturn.push(children[childIndex]);
          }
          // Is the minimum number of expected elements met? Then
          // we are done checking this child and allow the
          // next element in the sequence to take over.
          else if (subIndex >= expected.minOccurs) {
            return; // Effectively jumps to next `expected`
          }
          // We would expect more of this type, but haven't got any.
          else {
            // Hand out a (more or less) detailed error message
            context.addError(ErrorCodes.IllegalChildType, child, {
              present: child.qualifiedName,
              expected: expected.nodeType.description,
              index: childIndex,
            });
          }
        }
        // There is no child, is that valid?
        else {
          if (subIndex < expected.minOccurs) {
            // There is no child present, but the current type expects it
            context.addError(ErrorCodes.MissingChild, parent, {
              childrenCategory: this._group.categoryName,
              expected: expected.nodeType.description,
              index: childIndex
            } as ErrorMissingChild);
          } else {
            // There is no child present, but thats OK
            return; // Effectively jumps to next `expected`
          }
        }

        // Go for the next child
        childIndex++;
        subIndex++;
      }
    });

    // Any children left at this point are errors
    for (; childIndex < children.length; childIndex++) {
      context.addError(ErrorCodes.SuperflousChild, children[childIndex], {
        index: childIndex,
        present: children[childIndex].qualifiedName
      });
    }

    return (toReturn);
  }
}

/**
 * Ensures that every child-node is of a type that has been explicitly
 * whitelisted.
 */
class NodeComplexTypeChildrenAllowed extends NodeComplexTypeChildrenValidator {
  private _nodeTypes: ChildCardinality[];

  constructor(group: NodeTypeChildren, desc: Desc.NodeTypesAllowedDescription) {
    super(desc);

    const defaultLimit: Desc.OccursDescription = {
      minOccurs: 0,
      maxOccurs: +Infinity
    }

    this._nodeTypes = desc.nodeTypes.map(typeDesc => new ChildCardinality(typeDesc, group, defaultLimit));
  }

  /**
   * @return True, if any of the children in this group need to occur at least once.
   */
  get isRequiredImpl() {
    return (this._nodeTypes.some(c => c.minOccurs > 0));
  }

  /**
   * Ensures that every child has at least a matching type.
   */
  validateChildrenImpl(parent: AST.Node, children: AST.Node[], context: ValidationContext) {
    // These children are expected
    const toReturn: AST.Node[] = [];
    // Initially no node has occured so far
    const occurences: number[] = this._nodeTypes.map(_ => 0);

    // The "allowed" restriction can be checked by iterating over children
    // directly, the types are resolved on demand.
    children.forEach((node, index) => {
      // Find a matching type
      const cardinalityRef = this._nodeTypes.find(type => type.nodeType.matchesType(node.qualifiedName));
      if (!cardinalityRef) {
        // The node is entirely unexpected
        context.addError(ErrorCodes.IllegalChildType, node, {
          index: index,
          present: node.qualifiedName,
          expected: this._nodeTypes.map(t => t.nodeType)
        });
      } else {
        // The node is expected, but may occur too often. For the moment we simply count it.
        const cardinalityIndex = this._nodeTypes.indexOf(cardinalityRef);
        occurences[cardinalityIndex]++;
        toReturn.push(node);
      }
    });

    // Ensure that all cardinality limits have been respected
    occurences.forEach((num, index) => {
      const cardinalityRef = this._nodeTypes[index];
      if (num < cardinalityRef.minOccurs) {
        // A specific type appeared not often enough
        context.addError(ErrorCodes.InvalidMinOccurences, parent, {
          minOccurs: cardinalityRef.minOccurs,
          actual: num
        });
      }

      if (num > cardinalityRef.maxOccurs) {
        // A specific type appeared too often
        context.addError(ErrorCodes.InvalidMaxOccurences, parent, {
          maxOccurs: cardinalityRef.maxOccurs,
          actual: num
        });
      }
    });

    return (toReturn);
  }
}

/**
 * Validates any property.
 */
abstract class NodePropertyValidator {
  private _isOptional: boolean;
  private _base: string;

  constructor(desc: Desc.NodePropertyTypeDescription) {
    this._isOptional = !!desc.isOptional;
    this._base = desc.base;
  }

  abstract validate(node: AST.Node, value: string, context: ValidationContext): void;

  /**
   * @return This property may be omitted from a node.
   */
  get isOptional() {
    return (this._isOptional);
  }

  /**
   * @return The typename of the property
   */
  get baseName() {
    return (this._base);
  }
}

/**
 * Validates boolean properties
 */
class NodePropertyBooleanValidator extends NodePropertyValidator {

  constructor(desc: Desc.NodePropertyBooleanDescription) {
    super(desc);
  }

  validate(node: AST.Node, value: string, context: ValidationContext): void {
    if (value != "true" && value != "false") {
      context.addError(ErrorCodes.IllegalPropertyType, node, {
        condition: `"${value}" must be either "true" nor "false"`
      });
    }
  }
}

/**
 * Validates properties that are meant to be strings.
 */
class NodePropertyStringValidator extends NodePropertyValidator {
  private _restrictions: Desc.NodeStringTypeRestrictions[] = [];

  constructor(desc: Desc.NodePropertyStringDescription) {
    super(desc);
    if (desc.restrictions) {
      this._restrictions = desc.restrictions;
    }
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
        case "enum":
          if (!(restriction.value as string[]).includes(value)) {
            context.addError(ErrorCodes.IllegalPropertyType, node, {
              condition: `"${value}" in ${JSON.stringify(restriction.value)}`
            });
          }
          break;
        default:
          throw new Error(`Unknown string restriction: "${restriction.type}"`);
      }
    });
  }
}

/**
 * Ensures that given nodes match exactly one of the types given
 * in the description.
 */
class NodeOneOfType extends NodeType {

  private _possibilities: TypeReference[] = [];

  constructor(validator: Validator, typeDesc: Desc.NodeOneOfTypeDescription, language: string, name: string) {
    super(validator, language, name);

    this._possibilities = typeDesc.oneOf.map(t => new TypeReference(validator, t, language));
  }

  /**
   * As this node should never physically appear in a tree, asking
   * it for child categories is meaningless.
   */
  get requiredChildrenCategoryNames() {
    return ([]);
  }

  /**
   * Checks whether the given node is one of the nodes.
   */
  validate(ast: AST.Node, context: ValidationContext): void {
    // The "oneOf" node is not really a node that could be used anywhere
    if (this.languageName === ast.languageName && this.typeName === ast.typeName) {
      context.addError(ErrorCodes.TransientNode, ast, {
        present: ast.qualifiedName,
      } as ErrorUnexpectedType);
    } else {
      // Find a type that volunteers to do the actual further matching
      const concrete = this._possibilities.find(v => v.matchesType(ast.qualifiedName));
      if (concrete) {
        concrete.validate(ast, context);
      } else {
        context.addError(ErrorCodes.UnexpectedType, ast, {
          present: ast.qualifiedName,
          expected: this._possibilities.map(p => p.description)
        } as ErrorUnexpectedType);
      }
    }
  }

  /**
   * @return True if any type referenced by this instance  could be used to validate something
   *         of the given type.
   */
  matchesType(typeName: AST.QualifiedTypeName) {
    return (this._possibilities.some(t => t.matchesType(typeName)));
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
   * @return True, if the given node could be matched by the underlying type.
   */
  matchesType(qualifiedName: AST.QualifiedTypeName) {
    return (this.type.matchesType(qualifiedName));
  }

  /**
   * Validates using the underlying reference.
   */
  validate(ast: AST.Node, context: ValidationContext): void {
    this.type.validate(ast, context);
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
  private get type() {
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
class SchemaValidator {
  private _validator: Validator;
  private _languageName: string;
  private _registeredTypes: { [name: string]: NodeType } = {};
  private _rootType: TypeReference;

  constructor(validator: Validator, desc: Desc.ValidatorDescription) {
    this._validator = validator;
    this._languageName = desc.languageName;

    Object.entries(desc.types).forEach(([typeName, typeDesc]) => {
      this.registerTypeValidator(typeName, typeDesc)
    });

    this._rootType = new TypeReference(validator, desc.root, this._languageName);
  }

  /**
   * @return The validator this language has been registered to.
   */
  get validator() {
    return (this._validator);
  }

  /**
   * @return All types that are part of this language.
   */
  get availableTypes() {
    return (Object.values(this._registeredTypes));
  }

  validateFromRoot(ast: AST.Node, context: ValidationContext) {
    if (!this._rootType.isResolveable) {
      context.addError(ErrorCodes.UnknownRoot, ast);
    } else {
      this._rootType.validate(ast, context);
    }
  }

  /**
   * @return True if the given typename is known in this language.
   */
  isKnownType(typename: string) {
    return (!!this._registeredTypes[typename]);
  }

  /**
   * @return The type with the matching name.
   */
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
  private registerTypeValidator(nodeName: string, desc: Desc.NodeTypeDescription) {
    if (this.isKnownType(nodeName)) {
      throw new Error(`Attempted to register node "${nodeName}" twice for "${this._languageName}. Previous definition: ${JSON.stringify(this._registeredTypes[nodeName])}, Conflicting Definition: ${JSON.stringify(desc)}`);
    }

    if (Desc.isNodeConcreteTypeDescription(desc)) {
      this._registeredTypes[nodeName] = new NodeConcreteType(this._validator, desc, this._languageName, nodeName);
    } else if (Desc.isNodeOneOfTypeDescription(desc)) {
      this._registeredTypes[nodeName] = new NodeOneOfType(this._validator, desc, this._languageName, nodeName);
    }
  }
}

/**
 * A validator receives instances of one or multiple schemas and will
 * check any AST against those languages.
 */
export class Validator {
  private _registeredSchemas: { [langName: string]: SchemaValidator } = {};

  constructor(langs: Desc.ValidatorDescription[]) {
    langs.forEach(langDesc => this.register(langDesc));
  }

  /**
   * @return All individual schemas that are part of this validator.
   */
  get availableSchemas() {
    return (Object.entries(this._registeredSchemas).map(([name, types]) => {
      return ({
        name: name,
        types: types
      });
    }));
  }

  get availableTypes() {
    return (
      Object.values(this._registeredSchemas)
        .map(v => v.availableTypes)
        .reduce((lhs, rhs) => lhs.concat(rhs), [])
    );
  }

  /**
   * Registers a new language with this validator
   */
  private register(desc: Desc.ValidatorDescription) {
    if (this.isKnownLanguage(desc.languageName)) {
      throw new Error(`Attempted to register language "${desc.languageName}" twice`);
    }

    this._registeredSchemas[desc.languageName] = new SchemaValidator(this, desc);
  }

  /**
   * @param ast The root of the AST to validate
   * @return All errors that occured during evaluation
   */
  validateFromRoot(ast: AST.Node | AST.Tree) {
    let rootNode: AST.Node = undefined;
    if (ast instanceof AST.Tree && !ast.isEmpty) {
      rootNode = ast.rootNode;
    } else if (ast instanceof AST.Node) {
      rootNode = ast;
    }

    const context = new ValidationContext();

    if (rootNode) {
      // Pass validation to the appropriate language
      const lang = this.getLanguageValidator(rootNode.languageName);
      lang.validateFromRoot(rootNode, context);
    } else {
      // Not having a document is a single error
      context.addError(ErrorCodes.Empty, undefined);
    }

    return (new ValidationResult(context));
  }

  /**
   * @return The language that has been asked for. Throws if the language does not exist.
   */
  getLanguageValidator(language: string) {
    if (!this.isKnownLanguage(language)) {
      throw new Error(`Validator does not know language "${language}"`);
    } else {
      return (this._registeredSchemas[language]);
    }
  }

  /**
   * @return The type that has been asked for. Throws if the type does not exist.
   */
  getType(language: string, typename: string) {
    if (!this.isKnownType(language, typename)) {
      throw new Error(`Validator does not know type "${language}.${typename}"`);
    } else {
      return (this._registeredSchemas[language].getType(typename));
    }
  }

  /**
   * @return True if the given language is known to this validator.
   */
  isKnownLanguage(language: string) {
    return (!!this._registeredSchemas[language]);
  }

  /**
   * @return True if the given typename is known in the given language.
   */
  isKnownType(language: string, typename: string) {
    return (
      this.isKnownLanguage(language) &&
      this._registeredSchemas[language].isKnownType(typename)
    );
  }
}
