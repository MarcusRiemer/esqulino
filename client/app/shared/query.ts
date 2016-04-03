import {Table}                          from './table'
import {Model}                          from './query.model'
import * as SyntaxTree                  from './query.syntaxtree'

export {Model, SyntaxTree}

/**
 * Facade for a query that allows meaningful mapping to the UI.
 */
export class Query {
    public schema : Table[];
    private model : Model.Query;

    private _isDirty = false;

    private _name : string;
    private _id   : string;

    private _select : SyntaxTree.Select;
    private _from   : SyntaxTree.From;
    private _where  : SyntaxTree.Where;

    constructor(schema : Table[], model : Model.Query) {
        this._name = model.name;
        this._id = model.id;

        this.schema = schema;
        this.model = model;

        this._select = new SyntaxTree.Select(model.select);
        this._from = new SyntaxTree.From(model.from);

        if (model.where) {
            this._where = new SyntaxTree.Where(model.where);
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
     * @return True, if this instance requires a save.
     */
    get isDirty() {
        return (this._isDirty);
    }


    /**
     * @return A "meaningful" name for the query.
     */
    get name() {
        return (this._name);
    }

    /**
     * @param value The new "meaningful" name for this query
     */
    set name(value : string) {
        this._isDirty = true;
        this._name = value;
    }

    /**
     * @return A "meaningful" name for the query.
     */
    get id() {
        return (this._id);
    }

    /**
     * Calculates the SQL String representation of this query.
     */
    public toSqlString() : string {
        var toReturn = this._select.toString();
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
    public toModel() : Model.Query {
        let toReturn : Model.Query = {
            name : this._name,
            id : this._id,
            from : this._from.toModel(),
            select : this._select.toModel()
        };

        if (this._where) {
            toReturn.where = this._where.toModel();
        }
        
        return (toReturn);
    }
}
