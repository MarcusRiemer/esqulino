import { SchemaDescription } from './validator.description'

export interface ValidationItem {
  type: "error" | "warning"
  message: string
}

export class ValidationResult {

}

class RegisteredType {

}

/**
 * A schema consists of type definitions and
 */
class Schema {
  constructor(desc: SchemaDescription) {

  }
}

/**
 * A validator receives instances of one or multiple schemas and will
 * check any AST against those languages.
 */
class Validator {
  private _registeredLanguages: { [langName: string]: Schema };

  registerLanguage(desc: SchemaDescription) {
    this._registeredLanguages[desc.languageName] = new Schema(desc);
  }

  validate() {

  }
}
