import * as AST from "./syntaxtree";

// Groups together all error codes that exist in the core of the validator.
export enum ErrorCodes {
  // The AST does simply not exist at all
  Empty = "EMPTY",
  // A AST has a root node that does not match any allowed root node
  UnknownRoot = "UNKNOWN_ROOT",
  // A AST has a root node in an unknown language
  UnknownRootLanguage = "UNKNOWN_ROOT_LANGUAGE",
  // A different type was explicitly expected
  UnexpectedType = "UNEXPECTED_TYPE",
  // A node with a transient type was detected
  TransientNode = "TRANSIENT_NODE",
  // A specified child was expected, but simply did not exist
  MissingChild = "MISSING_CHILD",
  // A specific child was entirely unexpected
  SuperflousChild = "SUPERFLOUS_CHILD",
  // One or more children occur too often (for "allowed" restrictions)
  InvalidMaxOccurences = "INVALID_MAX_OCCURENCES",
  // One or more children occur not often enough (for "allowed" restrictions)
  InvalidMinOccurences = "INVALID_MIN_OCCURENCES",
  // A property was expected, but simply did not exist
  MissingProperty = "MISSING_PROPERTY",
  // A child was present, but somehow it's type wasn't asked for
  IllegalPropertyType = "ILLEGAL_PROPERTY_TYPE",
  // A property was present, but breached a restriction
  IllegalChildType = "ILLEGAL_CHILD_TYPE",
  // A type mentions a child category that is not present in a node
  SuperflousChildCategory = "SUPERFLOUS_CHILD_CATEGORY",
  // The single node was tested against all choices but no match was found
  NoChoiceMatching = "NO_CHOICE_MATCHING",
  // There should have been a node but there wasn't
  NoChoiceNodeAvailable = "NO_CHOICE_NODE_AVAILABLE",
  // There should have been exactly one node but there where too many
  SuperflousChoiceNodeAvailable = "TOO_MANY_CHOICE_NODES_AVAILABLE",
  // A parentheses group had no types and is therefore undecidable
  ParenthesesEmptyTypes = "PARENTHESES_EMPTY_TYPES",
}

/**
 * Detailed data about an unexpected type. Shows the type that is present
 * and possibly the types that were originally expected.
 */
export interface ErrorUnexpectedType {
  present: AST.QualifiedTypeName;
  expected: AST.QualifiedTypeName[];
}

/**
 * A child is not allowed in a certain position.
 */
export interface ErrorIllegalChildType {
  expected: AST.QualifiedTypeName;
  present: AST.QualifiedTypeName;
  category: string;
  index: number;
}

export interface ErrorMissingChild {
  expected: AST.QualifiedTypeName;
  category: string;
  index: number;
}

export interface ErrorSuperflousChild {
  present: AST.QualifiedTypeName;
  category: string;
  index: number;
}

export interface ErrorMissingProperty {
  expected: string;
  name: string;
}

// Details about an unknown child category
export interface ErrorUnknownChildCategory {
  categoryName: string;
}

export type ErrorData =
  | ErrorUnexpectedType
  | ErrorUnknownChildCategory
  | ErrorMissingChild
  | ErrorMissingProperty
  | any;

/**
 * Core data about the error. In every case the user will be confronted with the
 * error code and the node location. The attached data may be used to to display
 * some helpful hints.
 */
export interface ValidationError {
  code: string;
  node: AST.Node;
  data: ErrorData;
}

/**
 * A view of an actual error that does not contain any circular references.
 */
interface PrintableError {
  code: string;
  data?: ErrorData;
  offendingNode?: {
    qualifiedName: AST.QualifiedTypeName;
    location?: AST.NodeLocation;
  };
}

/**
 * Removes all cyclic dependencies from an error.
 */
export function printableError(e: ValidationError) {
  const toReturn: PrintableError = {
    code: e.code,
    data: e.data,
    offendingNode: undefined,
  };

  if (e.node) {
    toReturn.offendingNode = {
      qualifiedName: e.node.qualifiedName,
    };

    try {
      toReturn.offendingNode.location = e.node.location;
    } catch {}
  }

  return toReturn;
}

/**
 * Used during validation to accumulate validation results. Additionaly
 * provides some extra data that may be relevant during validation.
 */
export class ValidationContext {
  private _errors: ValidationError[] = [];

  constructor(public additional: Readonly<any> = {}) {}

  addError(code: ErrorCodes | string, node: AST.Node, data: ErrorData = {}) {
    this._errors.push({ code: code, node: node, data: data });
  }

  get errors() {
    return this._errors;
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

  /**
   * @return All errors that happened on the given node.
   */
  getErrorsOn(node: AST.Node) {
    return this._errors.filter((e) => e.node === node);
  }

  get isValid() {
    return this._errors.length === 0;
  }

  get errors() {
    return this._errors;
  }
}
