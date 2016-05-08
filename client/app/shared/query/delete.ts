import {
    Query, QueryFrom, QueryWhere
} from './base'

import {
    Schema
} from '../schema'
import {
    ValidationResult, Validateable
} from '../query.validation'

import * as Model                       from '../query.model'
import * as SyntaxTree                  from '../query.syntaxtree'

/**
 * An SQL DELETE query.
 */
export class QueryDelete extends Query implements QueryFrom, QueryWhere {
    private _delete : SyntaxTree.Delete;
    private _from   : SyntaxTree.From;
    private _where  : SyntaxTree.Where;

    constructor(schema : Schema, model : Model.QueryDescription) {
        super(schema, model);

        // Ensure that the model is valid
        if (!model.delete) {
            throw new Error("QuerySelect without Delete model");
        }

        if (!model.from) {
            throw new Error("QuerySelect without From model");
        }

        // Build SQL components from model
        this._delete = new SyntaxTree.Delete(model.delete, this);
        this._from = new SyntaxTree.From(model.from, this);

        if (model.where) {
            this._where = new SyntaxTree.Where(model.where, this);
        }
    }

    /**
     * The DELETE component of the query
     */
    get delete() : SyntaxTree.Delete {
        return (this._delete);
    }

    /**
     * The FROM component of the query
     */
    get from() : SyntaxTree.From {
        return (this._from);
    }

    /**
     * @return The WHERE component of the query
     */
    get where() : SyntaxTree.Where {
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
     * Not everything can be removed from a DELETE query, but the following
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
     * @return True, if all existing components are complete
     */
    protected validateImpl(schema : Schema) : ValidationResult {
        let children = [
            this._delete.validate(schema),
            this._from.validate(schema)
        ];

        if (this._where) {
            children.push(this._where.validate(schema));
        }

        return (new ValidationResult([], children));
    }

    /**
     * Calculates the SQL String representation of this query.
     */
    protected toSqlStringImpl() : string {
        var toReturn = this._delete.toString();
        toReturn += "\n" + this._from.toString();

        if (this._where) {
            toReturn += "\n" + this._where.toString();
        }

        return (toReturn);
    }

    /**
     * Serializes the whole query to the "over-the-wire" format.
     * @return The "over-the-wire" JSON representation
     */
    protected toModelImpl(toReturn : Model.QueryDescription) : Model.QueryDescription {
        toReturn.delete = this._delete.toModel();
        toReturn.from = this._from.toModel();

        if (this._where) {
            toReturn.where = this._where.toModel();
        }

        return (toReturn);
    }
}
