import {Schema} from './schema'

/**
 * Represents something that can be validated.
 */ 
export interface Validateable {
    /**
     * Validates this instance.
     *
     * @param validation The validation that is currently in
     *        progress.
     */
    validate(schema : Schema) : ValidationResult;
}

export interface SchemaError {
    
}

/**
 * Represents a schema validation.
 */
export class ValidationResult {
    private _errors : SchemaError[] = [];

    /**
     * The valid validation result.
     */
    static VALID = new ValidationResult();

    constructor(errors? : SchemaError[],
                prev? : ValidationResult[]) {
        // Copy over current errors, if there are any
        if (errors) {
            this._errors = errors;
        }

        // Copy over previous errors, if there are any
        if (prev) {
            prev.forEach(p => this._errors = this._errors.concat(p._errors));
        }
    }

    /**
     * @return True, if there are no errors.
     */
    get isValid() {
        return (this._errors.length === 0);
    }
}
