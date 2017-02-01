import {Schema, ColumnDescription}        from '../schema'

import * as Model                         from './description'
import * as SyntaxTree                    from './syntaxtree'
import {QueryAssign}                      from './assign'
import {QueryWhere}                       from './base'

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

    /**
     * Calculates the SQL String representation of this query.
     */
    protected toSqlStringImpl() : string {        
        const values = this.assignments
            .map(a => `${a.columnName} = ${a.expr.toSqlString()}`)
            .join(", ");
        
        let toReturn = `UPDATE ${this.tableName}\nSET ${values}`;        
        
        return (toReturn);
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