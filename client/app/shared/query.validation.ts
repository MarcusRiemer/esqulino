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

/**
 * An error that occured during schema validation
 */
export interface SchemaError {
    errorMessage : string;
}

/**
 * All types of error that can be detected during a validation.
 */
export module ValidationError {

    /**
     * Represents a column that is unknown.
     */
    export class UnknownColumn implements SchemaError {
        constructor(public table : string,
                    public column : string) {
        }

        get errorMessage() {
            return (`Unknown column "${this.column}" in table "${this.table}"`);
        }
    }

    /**
     * Represents a table that is unknown.
     */
    export class UnknownTable implements SchemaError {
        constructor(public table : string) {
        }

        get errorMessage() {
            return (`Unknown table "${this.table}"`);
        }
    }

    /**
     * Represents an expression that is missing.
     */
    export class MissingExpression implements SchemaError {
        constructor() {
        }

        get errorMessage() {
            return (`Missing Expression`);
        }
    }

    /**
     * The SELECT component must not be empty.
     */
    export class EmptySelect implements SchemaError {
        constructor() {
        }

        get errorMessage() {
            return (`SELECT must not be empty`);
        }
    }

    /**
     * A JOIN introduces an ambiguous table alias.
     */
    export class AmbiguousTableAlias implements SchemaError {
        constructor(public tablealias : string) {
        }
        
        get errorMessage() {
            return (`Ambiguous table alias "${this.tablealias}" `);
        }
    }

    /**
     * A self JOIN misses a table alias
     */
    export class MissingTableAlias implements SchemaError {
        constructor(public tablename : string) {
        }
        
        get errorMessage() {
            return (`Missing table alias for table "${this.tablename}" `);
        }
    }
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

    get numErrors() {
        return (this._errors.length);
    }

    getError(i : number) {
        return (this._errors[i]);
    }
}
