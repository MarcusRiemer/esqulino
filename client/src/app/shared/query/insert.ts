import {Schema, ColumnDescription}        from '../schema'

import * as Model                         from './description'
import {QueryAssign}                      from './assign'

/**
 * An SQL Insert query.
 */
export class QueryInsert extends QueryAssign {
    /**
     * Constructs a new INSERT Query from a model and matching
     * to a schema.
     */
    constructor(schema : Schema, model : Model.QueryDescription) {
        super (schema, model);
    }

    /**
     * Calculates the SQL String representation of this query.
     */
    protected toSqlStringImpl() : string {
        const columnNames = this.activeColumns.map(c => c.name).join(", ");
        const expressions = this.values.map(v => v.toSqlString()).join(", ");
    
        return (`INSERT INTO ${this.tableName} (${columnNames})\nVALUES (${expressions})`);
    }

    /**
     * Serializes the whole query to the "over-the-wire" format.
     * @return The "over-the-wire" JSON representation
     */
    protected toModelImpl(toReturn : Model.QueryDescription) : Model.QueryDescription {
        
        toReturn.insert = {
            assignments : this.assignments.map(v => {
                return ({
                    expr : v.expr.toModel(),
                    column : v.columnName
                });
            }),
            table : this.tableName,
        };
        
        return (toReturn);
    }


}
