import * as Model                             from '../description'
import {Query}                                from '../base'

import {Assign}                               from './assign'

export class Insert extends Assign {
    constructor(model : Model.Insert,
                query : Query) {
        super(model, query);
    }

    /**
     * Calculates the SQL String representation of this query.
     */
    toSqlString() : string {
        const columnNames = this.activeColumns.map(c => c.name).join(", ");
        const expressions = this.values.map(v => v.toSqlString()).join(", ");
    
        return (`INSERT INTO ${this.tableName} (${columnNames})\nVALUES (${expressions})`);
    }
}
