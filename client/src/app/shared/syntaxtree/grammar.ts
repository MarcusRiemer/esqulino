import * as Desc from './grammar.description'
import * as AST from './syntaxtree'

import { Validator } from './validator'
import {
  ErrorCodes, ValidationContext, ErrorMissingChild, ErrorMissingProperty,
  ErrorUnexpectedType
} from './validation-result'
import { OccursSpecificDescription } from './grammar.description';
import { resolveOccurs } from './grammar-util';
import { QualifiedTypeName } from './syntaxtree.description';

/**
 * Every type can be identified by its fully qualified name (language
 * & name) and has access to the validator instance this concrete
 * type was loaded into.
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
   * Determines whether the given type would be an *immediate* fit in the
   * given category. This check does *not* care about any possible errors
   * that would occur in the node of the given type. This partial check is
   * useful to determine "sort of" legal drag targets.
   *
   * @param childType The type that is possible added.
   * @param categoryName The name of the category in question.
   *
   * @return True, if this would be a legal, immediate fit.
   */
  abstract allowsChildType(childType: AST.QualifiedTypeName, categoryName: string): boolean;

  /**
   * These names are valid child categories
   */
  abstract get allowedChildrenCategoryNames(): string[];
}

/**
 * Describes a complex node that may have any kind of children.
 */
export class NodeConcreteType extends NodeType {

  private _allowedChildren: { [category: string]: NodeTypeChildren } = {};
  private _allowedProperties: { [propName: string]: NodePropertyValidator } = {};

  constructor(validator: Validator, typeDesc: Desc.NodeConcreteTypeDescription, language: string, name: string) {
    super(validator, language, name);

    if (typeDesc.attributes) {
      // Put the existing attributes into their respective buckets
      typeDesc.attributes.forEach(a => {
        switch (a.type) {
          case "property":
            this._allowedProperties[a.name] = this.instanciatePropertyValidator(a);
            break;
          case "allowed":
          case "sequence":
          case "choice":
            this._allowedChildren[a.name] = new NodeTypeChildren(this, a, a.name);
            break;
        }
      });
    }
  }

  /**
   * @return Names of all categories that could have children.
   */
  get allowedChildrenCategoryNames() {
    return (Object.keys(this._allowedChildren));
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

  allowsChildType(childType: AST.QualifiedTypeName, categoryName: string): boolean {
    const category = this._allowedChildren[categoryName];
    return !!(category && category.allowsChildType(childType));
  }

  /**
   * @return A NodePropertyValidator that validates the correct type.
   */
  private instanciatePropertyValidator(desc: Desc.NodePropertyTypeDescription): NodePropertyValidator {
    if (Desc.isNodePropertyStringDesciption(desc)) {
      return (new NodePropertyStringValidator(desc));
    } else if (Desc.isNodePropertyBooleanDesciption(desc)) {
      return (new NodePropertyBooleanValidator(desc));
    } else if (Desc.isNodePropertyIntegerDesciption(desc)) {
      return (new NodePropertyIntegerValidator(desc));
    } else {
      throw new Error(`Unknown property validator for base "${desc.base}"`);
    }
  }
}

/**
 * Creates a validator that matches the type of the given description.
 *
 * @param desc The description of the child group validator
 * @return A matching child group validator
 */
function instanciateChildGroupValidator(group: NodeTypeChildren, desc: Desc.NodeChildrenGroupDescription) {
  switch (desc.type) {
    case "allowed":
      return (new NodeComplexTypeChildrenAllowed(group, desc));
    case "sequence":
      return (new NodeComplexTypeChildrenSequence(group, desc));
    case "choice":
      return (new NodeComplexTypeChildrenChoice(group, desc));
    default:
      throw new Error(`Unknown child validator: "${JSON.stringify(desc)}"`);
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
    this._childValidator = instanciateChildGroupValidator(this, desc);
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
   * Determines whether the given type would be an *immediate* fit in this
   * category. This check does *not* care about any possible errors that
   * would occur in the node of the given type. This partial check is
   * useful to determine "sort of" legal drag targets.
   *
   * @param childType The type that is possible added.
   *
   * @return True, if this would be a legal, immediate fit.
   */
  allowsChildType(childType: AST.QualifiedTypeName): boolean {
    return (this._childValidator.allowsChildType(childType));
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

  /**
   * Delegates further checks to an implementation defined variation
   */
  validateChildren(parent: AST.Node, ast: AST.Node[], context: ValidationContext): AST.Node[] {
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
   * Determines whether the given type would be an *immediate* fit for this
   * validator. This check does *not* care about any possible errors that
   * would occur in the node of the given type. This partial check is
   * useful to determine "sort of" legal drag targets.
   *
   * @param childType The type that is possible added.
   *
   * @return True, if this would be a legal, immediate fit.
   */
  abstract allowsChildType(childType: AST.QualifiedTypeName): boolean;
}

/**
 * Describes bounds for the number of apperances a certain child may make.
 */
class ChildCardinality {
  private _nodeType: TypeReference;
  private _occurs: OccursSpecificDescription;

  constructor(typeDesc: Desc.NodeTypesChildReference, group: NodeTypeChildren) {
    const parent = group.parent;
    this._occurs = resolveOccurs(typeDesc);

    if (typeof (typeDesc) === "string") {
      // Simple strings always refer to the language of the parent.
      this._nodeType = new TypeReference(parent.validator, typeDesc, parent.languageName);
    } else if (Desc.isChildCardinalityDescription(typeDesc)) {
      // Complex descriptions may refer to a different language
      this._nodeType = new TypeReference(parent.validator, typeDesc.nodeType, parent.languageName);
    } else {
      throw new Error(`Unknown child cardinality: "${JSON.stringify(typeDesc)}"`);
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
    return (this._occurs.minOccurs);
  }

  /**
   * @return The maximum number of occurences that are expected
   */
  get maxOccurs() {
    return (this._occurs.maxOccurs);
  }
}

/**
 * Enforces a specific sequence of child-nodes of a parent node.
 */
class NodeComplexTypeChildrenSequence extends NodeComplexTypeChildrenValidator {
  private _nodeTypes: ChildCardinality[];
  private _group: NodeTypeChildren;

  constructor(group: NodeTypeChildren, desc: Desc.NodeTypesSequenceDescription) {
    super();

    this._group = group;
    this._nodeTypes = desc.nodeTypes.map(typeDesc => new ChildCardinality(typeDesc, group));
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

  /**
   * @return True, if the given type occurs anywhere in the list of possible types.
   */
  allowsChildType(childType: AST.QualifiedTypeName): boolean {
    return (this._nodeTypes.some(t => t.nodeType.matchesType(childType)));
  }
}

/**
 * Ensures that every child-node is of a type that has been explicitly
 * whitelisted.
 */
class NodeComplexTypeChildrenAllowed extends NodeComplexTypeChildrenValidator {
  private _nodeTypes: ChildCardinality[];
  private _categoryName: string;

  constructor(group: NodeTypeChildren, desc: Desc.NodeTypesAllowedDescription) {
    super();

    this._categoryName = group.categoryName;
    this._nodeTypes = desc.nodeTypes.map(typeDesc => new ChildCardinality(typeDesc, group));
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
          expected: this._nodeTypes.map(t => t.nodeType.description)
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
          category: this._categoryName,
          type: this._nodeTypes[index].nodeType.description,
          minOccurs: cardinalityRef.minOccurs,
          actual: num
        });
      }

      if (num > cardinalityRef.maxOccurs) {
        // A specific type appeared too often
        context.addError(ErrorCodes.InvalidMaxOccurences, parent, {
          category: this._categoryName,
          type: this._nodeTypes[index].nodeType.description,
          maxOccurs: cardinalityRef.maxOccurs,
          actual: num
        });
      }
    });

    return (toReturn);
  }

  /**
   * @return True, if the given type occurs anywhere in the list of possible types.
   */
  allowsChildType(childType: AST.QualifiedTypeName): boolean {
    return (this._nodeTypes.some(t => t.nodeType.matchesType(childType)));
  }
}

/**
 * Ensures that at least one of the given choices matches the child group.
 */
class NodeComplexTypeChildrenChoice extends NodeComplexTypeChildrenValidator {
  private _desc: Desc.NodeTypesChoiceDescription;
  private _group: NodeTypeChildren;

  constructor(group: NodeTypeChildren, desc: Desc.NodeTypesChoiceDescription) {
    super();
    this._desc = desc;
    this._group = group;
  }

  /**
   * Runs the choice validation against a certain node.
   */
  protected validateChildrenImpl(parent: AST.Node, ast: AST.Node[], context: ValidationContext): AST.Node[] {
    if (ast.length === 0) {
      // TODO: Tell category
      context.addError(ErrorCodes.NoChoiceNodeAvailable, parent, {});
      return ([]);
    } else {
      // Check whether the first (and hopefully only) node is a match?
      const hasMatch = this._desc.choices.some(possible => {
        // Build fully qualified type for this possibility.
        const possibleType = this.typeNameFromChoice(possible);

        // Check whether the type matches or not
        return (AST.typenameEquals(possibleType, ast[0].qualifiedName));
      });

      if (!hasMatch) {
        context.addError(ErrorCodes.NoChoiceMatching, ast[0], {});
      }

      // If there are any more nodes: They shouldn't be there
      ast.slice(1).forEach(node => context.addError(ErrorCodes.SuperflousChoiceNodeAvailable, node, {}));

      return (hasMatch ? [ast[0]] : []);
    }
  }

  /**
   * @return The name of the language this validator is part of.
   */
  protected get ownLanguageName() {
    return (this._group.parent.languageName)
  }

  protected typeNameFromChoice(possible: Desc.TypeReference): AST.QualifiedTypeName {
    const possibleName = typeof possible === "string" ? possible : possible.typeName;
    const possibleLanguage = typeof possible === "string" ? this.ownLanguageName : possible.languageName;

    return {
      languageName: possibleLanguage,
      typeName: possibleName
    }
  }

  /**
   * @return True, if the given type occurs anywhere in the list of possible types.
   */
  allowsChildType(childType: AST.QualifiedTypeName): boolean {
    return (this._desc.choices
      .map(choice => this.typeNameFromChoice(choice))
      .some(choiceType => AST.typenameEquals(childType, choiceType)));
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
export class NodePropertyBooleanValidator extends NodePropertyValidator {

  constructor(desc: Desc.NodePropertyBooleanDescription) {
    super(desc);
  }

  validate(node: AST.Node, value: string, context: ValidationContext): void {
    if (value != "true" && value != "false") {
      context.addError(ErrorCodes.IllegalPropertyType, node, {
        condition: `"${value}" must be either "true" or "false"`
      });
    }
  }
}

/**
 * Validates integer properties
 */
export class NodePropertyIntegerValidator extends NodePropertyValidator {
  private _restrictions: Desc.NodeIntegerTypeRestrictions[];

  constructor(desc: Desc.NodePropertyIntegerDescription) {
    super(desc);
    this._restrictions = desc.restrictions;
  }

  validValue(value: string): boolean {
    // The typescript type system forbids other values then strings, but
    // they occasionally happen anyway.
    return (typeof value === "string" && /^-?[0-9]+$/.test(value));
  }

  validate(node: AST.Node, value: string, context: ValidationContext): void {
    if (!this.validValue(value)) {
      context.addError(ErrorCodes.IllegalPropertyType, node, {
        condition: `"${value}" must be a string that looks like an integer`
      });
    } else {
      this._restrictions.forEach(r => {
        switch (r.type) {
          case "minInclusive":
            if (+value < r.value) {
              context.addError(ErrorCodes.IllegalPropertyType, node, {
                condition: `Failed: ${value} ≥ ${r.value}`
              });
            }
            break;
          case "maxInclusive":
            if (+value > r.value) {
              context.addError(ErrorCodes.IllegalPropertyType, node, {
                condition: `Failed: ${value} ≤ ${r.value}`
              });
            }
            break;
        }
      });
    }
  }
}

/**
 * Validates properties that are meant to be strings.
 */
export class NodePropertyStringValidator extends NodePropertyValidator {
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
        case "regex":
          const regex = new RegExp(restriction.value as string);
          if (!regex.test(value)) {
            context.addError(ErrorCodes.IllegalPropertyType, node, {
              condition: `"${value}" did not match regular expression "${restriction.value}"`
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
   * As this node should never physically appear in a tree, asking
   * it for child categories is meaningless.
   */
  get allowedChildrenCategoryNames() {
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

  allowsChildType(childType: AST.QualifiedTypeName, _categoryName: string): boolean {
    return (this.matchesType(childType));
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
    } else if (typeof desc === "string") {
      this._languageName = currentLang;
      this._typeName = desc;
    } else {
      throw new Error("Impossible: Unknown type reference");
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
export class GrammarValidator {
  private _validator: Validator;
  private _grammarName: string;
  private _registeredTypes: { [name: string]: NodeType } = {};
  private _rootType: TypeReference;

  constructor(validator: Validator, desc: Desc.GrammarDocument) {
    this._validator = validator;
    this._grammarName = desc.technicalName;

    Object.entries(desc.types).forEach(([typeName, typeDesc]) => {
      this.registerTypeValidator(typeName, typeDesc)
    });

    this._rootType = new TypeReference(validator, desc.root, this._grammarName);
  }

  /**
   * @return The technical name of this grammar
   */
  get grammarName() {
    return (this._grammarName);
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

  /**
   * Validates the given tree in the given context. Ensures that a valid
   * type is used as the root.
   */
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
      throw new Error(`Language "${this._grammarName}" does not have type "${typename}"`);
    } else {
      return (this._registeredTypes[typename]);
    }
  }

  /**
   * Registers a new type validator with this language.
   */
  private registerTypeValidator(nodeName: string, desc: Desc.NodeTypeDescription) {
    if (this.isKnownType(nodeName)) {
      throw new Error(`Attempted to register node "${nodeName}" twice for "${this._grammarName}. Previous definition: ${JSON.stringify(this._registeredTypes[nodeName])}, Conflicting Definition: ${JSON.stringify(desc)}`);
    }

    if (Desc.isNodeConcreteTypeDescription(desc)) {
      this._registeredTypes[nodeName] = new NodeConcreteType(this._validator, desc, this._grammarName, nodeName);
    } else if (Desc.isNodeOneOfTypeDescription(desc)) {
      this._registeredTypes[nodeName] = new NodeOneOfType(this._validator, desc, this._grammarName, nodeName);
    }
  }
}
