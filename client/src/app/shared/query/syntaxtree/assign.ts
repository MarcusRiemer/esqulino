import {Schema, ColumnDescription}            from '../../schema'

import {Update, Insert}                       from '../description'
import {Query}                                from '../base'
import {Validateable, ValidationResult}       from '../validation'

import {
    Component, Expression, Removable, loadExpression
} from './common'

interface ColumnAssignment {
    columnName : string
    expr : Expression
}

/**
 * An SQL-component that assigns key-value-pairs. This is the
 * base class for INSERT and UPDATE, which have a *very* similar.
 * internal model.
 */
export abstract class Assign extends Component {

    // The table this query inserts something into.
    private _tableName : string;

    // The currently stored values
    private _values : ColumnAssignment[] = [];

    /**
     * Constructs a new INSERT or UPDATE Query from a model and matching
     * to a schema.
     */
    constructor(model : Insert | Update,
                query : Query) {
        super (query);

        // Switch over the concrete type
        this._tableName = model.table;

        // Grab the correct assignments
        model.assignments.forEach( (desc) => {
            this._values.push({
                columnName : desc.column,
                expr : loadExpression(desc.expr, this)
            });
        });  

    }

    get schema() : Schema {
        return (this.query.schema);
    }
    
    /**
     * @return All columns these assignments would use.
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

    set tableName(newName : string) {
        this._tableName = newName;
        this.fireModelChange();
    }

    getLeaves() : Expression[] {
        return (this.values);
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
            if (!alreadyActivated) {
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
        this.fireModelChange();
    }

    getLocationDescription() {
        return ("VALUES");
    }

    replaceChild(formerChild : Expression, newChild : Expression) : void {
        const replaceIndex = this._values.findIndex(v => v.expr == formerChild);
        
        if (replaceIndex >= 0) {
            this._values[replaceIndex].expr = newChild;
            this.fireModelChange();
        } else {
            throw new Error("Could not find child");
        }
    }

    removeChild(formerChild : Removable) : void {
        throw new Error("Not implemented");
    }

    /**
     * Serializes the whole query to the "over-the-wire" format.
     * @return The "over-the-wire" JSON representation
     */
    toModel() : Update | Insert {
        return ({
            table : this.tableName,
            assignments : this.assignments.map(v => {
                return ({
                    expr : v.expr.toModel(),
                    column : v.columnName
                });
            })
        });
    }

    validate(schema : Schema) : ValidationResult {
        return (new ValidationResult([], this._values.map(v => v.expr.validate(schema))));
    }
}
