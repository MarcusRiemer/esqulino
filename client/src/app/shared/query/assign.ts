import {Schema, ColumnDescription}        from '../schema'

import {Query}                            from './base'

import {loadExpression, Expression}       from './syntaxtree'
import {ValidationResult, Validateable}   from './validation'

import * as Model                         from './description'
import * as SyntaxTree                    from './syntaxtree'

interface ColumnAssignment {
    columnName : string
    expr : Expression
}

/**
 * An SQL-query that assigns key-value-pairs. This is the
 * base class for INSERT and UPDATE, which have a *very* similar.
 * internal model.
 */
export abstract class QueryAssign extends Query {

    // The table this query inserts something into.
    private _tableName : string;

    // The currently stored values
    private _values : ColumnAssignment[] = [];

    /**
     * Constructs a new INSERT Query from a model and matching
     * to a schema.
     */
    constructor(schema : Schema, model : Model.QueryDescription) {
        super (schema, model);

        // Switch over the concrete type
        const queryDesc = (!!model.insert) ? model.insert : model.update;
        this._tableName = queryDesc.table;

        // Grab the correct assignments
        const assignments = (!!model.insert) ? model.insert.assignments : model.update.assignments;
        assignments.forEach( (desc) => {
            this._values.push({
                columnName : desc.column,
                expr : loadExpression(desc.expr, this)
            });
        });  

    }

    /**
     * @return All columns this insert would use.
     */
    get activeColumns() : ColumnDescription[] {
        return (this._values.map(assign => this.schema.getColumn(this._tableName, assign.columnName)));
    }

    /**
     * @return The values that would be inserted.
     */
    get values() : Expression[] {
        return (this._values.map(v => v.expr));
    }

    /**
     * @return All available assignments
     */
    protected get assignments() : ColumnAssignment[] {
        return (this._values);
    }

    /**
     * @return The name of the table new data will be inserted to.
     */
    get tableName() : string {
        return (this._tableName);
    }

    /**
     * @return The expression that is associated with that column.
     */
    getValueForColumn(columnName : string) : Expression {
        const col = this._values.find(v => v.columnName == columnName);
        if (col) {
            return (col.expr);
        } else {
            return (undefined);
        }
    }

    /**
     * Activates or deactivates the inclusion of the given column.
     */
    changeActivationState(columnName : string, active : boolean) {
        const alreadyActivated = this._values.some(v => v.columnName == columnName);
        
        // Is the new state active?
        if (active) {
            // Is it activated already?
            if (alreadyActivated) {
                // It shouldn't be
                const column = this.schema.getColumn(this.tableName, columnName);
                throw new Error(`Activating: Column "${column.name}" is already active`);
            } else {
                // Activate it
                this._values.push({
                    columnName : columnName,
                    expr : loadExpression({ missing : {} }, this)
                });
            }
        } else {
            // Is it already deactivated?
            if (alreadyActivated == false) {
                // It shouldn't be
                const column = this.schema.getColumn(this.tableName, columnName);
                throw new Error(`Deactivating: Column "${column.name}" is already deactivated`);
            } else {
                // Deactivate it by removing all references to it
                const index = this._values.findIndex(v => v.columnName == columnName);
                this._values.splice(index, 1);
            }
        }

        // If the program flow reaches this point, a change has been made
        this.markSaveRequired();
    }

    getLocationDescription() {
        return ("VALUES");
    }

    replaceChild(formerChild : Expression, newChild : Expression) : void {
        const replaceIndex = this._values.findIndex(v => v.expr == formerChild);
        
        if (replaceIndex >= 0) {
            this._values[replaceIndex].expr = newChild;
            this.markSaveRequired();
        } else {
            throw new Error("Could not find child");
        }
    }

    removeChild(formerChild : SyntaxTree.Removable) : void {
        throw new Error("Not implemented");
    }

    protected validateImpl(schema : Schema) : ValidationResult {
        return (new ValidationResult([], this._values.map(v => v.expr.validate(schema))));
    }

    /**
     * Calculates the SQL String representation of this query.
     */
    protected toSqlStringImpl() : string {
        const columnNames = this.activeColumns.map(c => c.name).join(", ");
        const expressions = this.values.map(v => v.toSqlString()).join(", ");
    
        return (`INSERT INTO ${this._tableName} (${columnNames})\nVALUES (${expressions})`);
    }

    public getLeaves() : SyntaxTree.Expression[] {
        const nested = this._values.map(v => v.expr.getLeaves());

        return ([].concat.apply([], nested));
    }

}