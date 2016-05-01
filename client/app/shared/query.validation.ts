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
    validate(validation : QueryValidation) : void;
}

export interface SchemaError {
    
}

/**
 * Represents a schema validation.
 */
export class QueryValidation {
    private _schema : Schema
    private _errors : SchemaError[] = [];

    constructor(schema : Schema) {
        this._schema = schema;
    }

    /**
     * Adds a new error to this validation, effectively ensuring that this
     * validation will be invalid.
     */
    addError(error : SchemaError) {
        this._errors.push(error);
    }

    /**
     * @return The schema 
     */
    get schema() {
        return (this._schema);
    }

    /**
     * @return True, if there are no errors.
     */
    get isValid() {
        return (this._errors.length === 0);
    }
}
