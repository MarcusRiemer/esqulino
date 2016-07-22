import {Schema}                          from '../schema'

import {Locateable}                      from './syntaxtree/common'
import {Expression, ColumnExpression}    from './syntaxtree/expression'
import {Join}                            from './syntaxtree/from'

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
export interface ValidationError {
    /**
     * @return A human readable description of the error
     */
    errorMessage : string;

    /**
     * @return The human readable location of this error
     */
    location : string;
}

/**
 * All types of error that can be detected during a validation.
 */
export module ValidationErrors {

    /**
     * Helps implementing errors that are based on expressions.
     */
    abstract class LocateableError<TLoc extends Locateable>
        implements ValidationError {

        /**
         * The faulty expression.
         */
        protected _loc : TLoc;

        constructor(expr : TLoc) {
            this._loc = expr;
        }

        /**
         * @return A human readable description of the error location
         */     
        get location() : string {
            return (this._loc.getLocationDescription());
        }
        
        /**
         * @remark As Typescript 1.8 does not allow abstract
         *         properties, this is an ugly indirection step.
         *
         * @return A human readable description of the error
         */
        get errorMessage() : string {
            return (this.errorMessageImpl());
        }

        /**
         * As Typescript 1.8 does not allow abstract properties, this
         * is an ugly indirection step and simply called by the not
         * abstract errorMessage accessor.
         */
        abstract errorMessageImpl() : string;
    }
    
    /**
     * Represents a column that is unknown.
     */
    export class UnknownColumn extends LocateableError<ColumnExpression> {        
        constructor(expr : ColumnExpression) {
            super(expr);
        }

        errorMessageImpl() {
            return (`Unknown column "${this._loc.columnName}" in table "${this._loc.tableName}"`);
        }
    }

    interface TableEntity extends Locateable {
        tableName : string
    }

    /**
     * Represents a table that is unknown.
     */
    export class UnknownTable extends LocateableError<TableEntity> {  
        constructor(entity : TableEntity) {
            super(entity);
        }

        errorMessageImpl() {
            return (`Unknown table "${this._loc.tableName}"`);
        }
    }

    /**
     * Used for components that don't allow JOINs.
     */
    export class SingleTableRequired implements ValidationError {
        constructor(private _componentName : string) {

        }

        get errorMessage() {
            return (`Only a single table allowed`);
        }

        get location() {
            return (this._componentName);
        }
    }

    /**
     * Represents an expression that is missing.
     */
    export class MissingExpression extends LocateableError<Expression> {
        constructor(expr : Expression) {
            super(expr);
        }

        errorMessageImpl() {
            return (`Missing Expression`);
        }
    }

    /**
     * The SELECT component must not be empty.
     */
    export class EmptySelect implements ValidationError {
        constructor() {
        }

        get errorMessage() {
            return (`SELECT must not be empty`);
        }

        get location() {
            return ("SELECT");
        }
    }

    /**
     * A JOIN introduces an ambiguous table alias.
     */
    export class AmbiguousTableAlias implements ValidationError {
        constructor(public tablealias : string) {
        }
        
        get errorMessage() {
            return (`Multiple JOINs use the alias "${this.tablealias}" `);
        }

        get location() {
            return ("FROM");
        }
    }

    /**
     * A self JOIN misses a table alias
     */
    export class MissingTableAlias implements ValidationError {
        constructor(public tableName : string, public location : string) {
        }
        
        get errorMessage() {
            return (`Missing table alias for table "${this.tableName}" `);
        }
    }
}

/**
 * Represents a schema validation.
 */
export class ValidationResult {
    private _errors : ValidationError[] = [];

    /**
     * The valid validation result.
     */
    static VALID = new ValidationResult();

    constructor(errors? : ValidationError[],
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

    get errors() {
        return (this._errors);
    }

    getError(i : number) {
        return (this._errors[i]);
    }
}
