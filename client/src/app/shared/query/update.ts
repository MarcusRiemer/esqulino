import {Schema, ColumnDescription}        from '../schema'

import {Query, Model, SyntaxTree, QueryWhere}    from './base'

import {
    ValidationResult, Validateable
} from './validation'

interface ColumnAssignment {
    columnName : string
    expr : SyntaxTree.Expression
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
     * Constructs a new INSERT or UPDATE Query from a model and matching
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
                expr : SyntaxTree.loadExpression(desc.expr, this)
            });
        });  

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
    get values() : SyntaxTree.Expression[] {
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
    getValueForColumn(columnName : string) : SyntaxTree.Expression {
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
                    expr : SyntaxTree.loadExpression({ missing : {} }, this)
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

    replaceChild(formerChild : SyntaxTree.Expression, newChild : SyntaxTree.Expression) : void {
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
}


/**
 * An SQL UPDATE query.
 */
export class QueryUpdate extends QueryAssign implements QueryWhere {
    private _where : SyntaxTree.Where;

    /**
     * Constructs a new INSERT Query from a model and matching
     * to a schema.
     */
    constructor(schema : Schema, model : Model.QueryDescription) {
        super (schema, model);

        if (model.where) {
            this._where = new SyntaxTree.Where(model.where, this);
        }
    }

    get where() : SyntaxTree.Where {
        return (this._where);
    }

    set where(value : SyntaxTree.Where) {
        this._where = value;
        this.markSaveRequired();
    }

    getLeaves() : SyntaxTree.Expression[] {
        let toReturn : SyntaxTree.Expression[] = [];
        if (!!this._where) {
            toReturn = this._where.getLeaves();
        }

        toReturn = this.values.concat(toReturn);
        return (toReturn);
    }


    /**
     * Calculates the SQL String representation of this query.
     */
    protected toSqlStringImpl() : string {        
        const values = this.assignments
            .map(a => `${a.columnName} = ${a.expr.toSqlString()}`)
            .join(", ");
        
        let toReturn = `UPDATE ${this.tableName}\nSET ${values}`;

        if (this._where) {
            toReturn += `\n` + this._where.toSqlString();
        }
        
        return (toReturn);
    }

    removeChild(formerChild : SyntaxTree.Removable) : void {
        if (this._where == formerChild) {
            this._where = undefined;
            this.markSaveRequired();
        } else {
            throw new Error("Unknown child");
        }
    }

    /**
     * Serializes the whole query to the "over-the-wire" format.
     * @return The "over-the-wire" JSON representation
     */
    protected toModelImpl(toReturn : Model.QueryDescription) : Model.QueryDescription {
        
        toReturn.update = {
            assignments : this.assignments.map(v => {
                return ({
                    expr : v.expr.toModel(),
                    column : v.columnName
                });
            }),
            table : this.tableName,
        };

        if (this._where) {
            toReturn.where = this._where.toModel();
        }
        
        return (toReturn);
    }
}
