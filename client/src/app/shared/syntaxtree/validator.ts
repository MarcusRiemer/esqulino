import * as Desc from './validator.description'

export interface ValidationItem {
  type: "error" | "warning"
  message: string
}

/**
 * Represents the result of a completed validation.
 */
export class ValidationResult {

}

/**
 * Used during validation to accumulate validation results.
 */
class ValidationContext {

}

/**
 * Base class for types describing simple and complex nodes. Derived
 * instances of this class are registered as part of a schema.
 */
abstract class NodeType {
  private _familyName: string;
  private _nodeName: string;

  constructor(typeDesc: Desc.NodeTypeDescription, familyName: string) {
    this._nodeName = typeDesc.nodeName;
    this._familyName = familyName;
  }
}

class NodeComplexType extends NodeType {
  constructor(typeDesc: Desc.NodeTypeDescription, familyName: string) {
    super(typeDesc, familyName)
  }
}

class NodeComplexTypeChildren {

}

class NodeComplexTypeChildrenSequence {

}

/**
 * A schema consists of type definitions and
 */
class Schema {
  constructor(desc: Desc.SchemaDescription) {

  }
}

/**
 * A validator receives instances of one or multiple schemas and will
 * check any AST against those languages.
 */
class Validator {
  private _registeredLanguages: { [langName: string]: Schema };

  registerLanguage(desc: Desc.SchemaDescription) {
    this._registeredLanguages[desc.languageName] = new Schema(desc);
  }

  validate() {

  }
}
