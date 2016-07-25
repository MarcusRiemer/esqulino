import {
    Query, QueryFrom, QueryWhere, ResultColumn
} from './base'

import {
    Schema
} from '../schema'
import {
    ValidationResult, Validateable
} from './validation'

import * as Model                       from './description'
import * as SyntaxTree                  from './syntaxtree'

export {ResultColumn}

/**
 * A query that reads data, but never mutates anything.
 */
export class QuerySelect extends Query implements QueryFrom, QueryWhere {

    private _select : SyntaxTree.Select;
    private _from   : SyntaxTree.From;
    private _where  : SyntaxTree.Where;

    constructor(schema : Schema, model : Model.QueryDescription) {
        super(schema, model);

        // Ensure that the model is valid
        if (!model.select) {
            throw new Error("QuerySelect without Select model");
        }

        if (!model.from) {
            throw new Error("QuerySelect without From model");
        }

        // Build SQL components from model
        this._select = new SyntaxTree.Select(model.select, this);
        this._from = new SyntaxTree.From(model.from, this);

        if (model.where) {
            this._where = new SyntaxTree.Where(model.where, this);
        }
    }

    /**
     * @return True, if all existing components are complete
     */
    protected validateImpl(schema : Schema) : ValidationResult {
        let children = [
            this._select.validate(schema),
            this._from.validate(schema)
        ];

        if (this._where) {
            children.push(this._where.validate(schema));
        }

        return (new ValidationResult([], children));
    }

    /**
     * Not everything can be removed from a SELECT query, but the following
     * components are fine:
     * * WHERE
     */
    removeChild(formerChild : SyntaxTree.Removable) : void {
        if (this._where == formerChild) {
            this._where = null;
            this.markDirty();
        }
    }

    /**
     * @return The FROM component of this query, guaranteed to be present.
     */
    get select() {
        return (this._select);
    }

    /**
     * @return The FROM component of this query, guaranteed to be present.
     */
    get from() {
        return (this._from);
    }

    /**
     * @return The WHERE component of this query, may or may not be present,
     *         depending on the underlying model.
     */
    get where() {
        return (this._where);
    }

    /**
     * Allows to set a new WHERE component, if it is not already present.
     *
     * @param where The new WHERE component
     */
    set where(where : SyntaxTree.Where) {
        if (this._where) {
            throw new Error("WHERE clause already present");
        }

        this._where = where;
        this.markDirty();
    }

    /**
     * Calculates the SQL String representation of this query.
     */
    protected toSqlStringImpl() : string {
        var toReturn = this._select.toSqlString();
        toReturn += "\n" + this._from.toSqlString();

        if (this._where) {
            toReturn += "\n" + this._where.toSqlString();
        }

        return (toReturn);
    }

    /**
     * Serializes the whole query to the "over-the-wire" format.
     * @return The "over-the-wire" JSON representation
     */
    protected toModelImpl(toReturn : Model.QueryDescription) : Model.QueryDescription {
        toReturn.from = this._from.toModel();
        toReturn.select = this._select.toModel();

        if (this._where) {
            toReturn.where = this._where.toModel();
        }
        
        return (toReturn);
    }

    public getLeaves() : SyntaxTree.Expression[] {
        const leavesSelect = this._select ? this._select.getLeaves() : [];
        const leavesWhere = this._where ? this._where.getLeaves() : [];
        
        
        return (leavesSelect.concat(leavesWhere));
    }
}
