import {Query}                            from './base'

import {loadExpression, ExpressionParent} from '../query.syntaxtree'
import {Schema}                           from '../schema'
import {ValidationResult, Validateable}   from '../query.validation'

import * as Model                         from '../query.model'
import * as SyntaxTree                    from '../query.syntaxtree'

/**
 * An SQL Insert query.
 */
export class QueryInsert extends Query {

    // The indices of the columns that are filled with this query
    private _columnIndices : number[];

    // The table this query inserts something into.
    private _tableName : string;

    // The currently stored values
    private _values : { [matchingIndex:number] : SyntaxTree.Expression } = {};
    
    constructor(schema : Schema, model : Model.QueryDescription) {
        super (schema, model);

        this._tableName = model.insert.table;
        this._columnIndices = model.insert.columns;

        model.insert.values.forEach( (expr, i) => this._values[i] = loadExpression(expr, this));
    }

    /**
     * @return All columns this insert would use.
     */
    get activeColumns() {
        return (this._columnIndices.map(i => this.schema.getColumnByIndex(this._tableName,  i)));
    }

    /**
     * @return The values that would be inserted.
     */
    get values() {
        return (this._columnIndices.map(i => this._values[i]));
    }

    /**
     * @return The name of the table new data will be inserted to
     */
    get tableName() {
        return (this._tableName);
    }

    getValueForColumn(columnIndex : number) {
        return (this._values[columnIndex]);
    }

    /**
     *
     */
    changeActivationState(index : number, active : boolean) {
        const alreadyActivated = this._columnIndices.some( v => v == index);
        
        // Is the new state active?
        if (active) {
            // Is it activated already?
            if (alreadyActivated) {
                // It shouldn't be
                const column = this.schema.getColumnByIndex(this.tableName, index);
                throw new Error(`Activating: Column #${index} (${column.name}) is already active`);
            } else {
                // Activate it
                this._columnIndices.push(index);
                this._values[index] = loadExpression({ missing : {} }, this);
            }
        } else {
            // Is it already deactivated?
            if (alreadyActivated == false) {
                // It shouldn't be
                const column = this.schema.getColumnByIndex(this.tableName, index);
                throw new Error(`Deactivating: Column #${index} (${column.name}) is already deactivated`);
            } else {
                // Deactivate it by removing all references to it
                this._columnIndices.splice(this._columnIndices.indexOf(index), 1);
                delete this._values[index];
            }
        }
    }

    getLocationDescription() {
        return ("VALUES");
    }

    replaceChild(formerChild : ExpressionParent, newChild : ExpressionParent) : void {
        throw new Error("Not implemented");
    }

    removeChild(formerChild : SyntaxTree.Removable) : void {
        throw new Error("Not implemented");
    }

    protected validateImpl(schema : Schema) : ValidationResult {
        return (new ValidationResult([]));
    }

    /**
     * Calculates the SQL String representation of this query.
     */
    protected toSqlStringImpl() : string {
        const columnNames = this.activeColumns.map(c => c.name).join(", ");
        const expressions = this.values.map(v => v.toString()).join(", ");
    
        return (`INSERT INTO ${this._tableName} (${columnNames})\nVALUES (${expressions})`);
    }

    /**
     * Serializes the whole query to the "over-the-wire" format.
     * @return The "over-the-wire" JSON representation
     */
    protected toModelImpl(toReturn : Model.QueryDescription) : Model.QueryDescription {
        return (toReturn);
    }

}
