import {Table}                          from './table'
import * as Model                       from './query.model'
import * as SyntaxTree                  from './query.syntaxtree'

export {Model, SyntaxTree}

/**
 * Storing a query on the server
 */
export interface QueryUpdateRequestDescription {
    model : Model.Query,
    sql? : string
}

/**
 * Facade for a query that allows meaningful mapping to the UI.
 */
export abstract class Query implements SyntaxTree.RemovableHost {
    public schema : Table[];
    private model : Model.Query;
    
    private _isDirty = false;

    private _name : string;
    private _id   : string;

    /**
     * Stores all basic information about a string.
     */
    constructor(schema : Table[], model : Model.Query) {
        this._name = model.name;
        this._id = model.id;

        this.schema = schema;
        this.model = model;
    }

    /**
     * @return True, if this query could be serialized to SQL.
     */
    protected abstract isCompleteImpl() : boolean;

    /**
     * @return The SQL representation of this query.
     */
    protected abstract toSqlStringImpl() : string;

    /**
     * Retrieves the SQL representation of this query.
     *
     * @pre The query needs to be complete.
     * @return An SQL string that represents this query.
     */
    public toSqlString() : string {
        if (!this.isComplete) {
            throw { "err" : `Query "${this.name}" is incomplete and can't be serialized to SQL` }
        }

        return (this.toSqlStringImpl());
    }
    
    /**
     * @return True, if this instance has changes that could be saved..
     */
    get isDirty() {
        return (this._isDirty);
    }

    /**
     * Called when a query has been made to this change.
     */
    protected markDirty() : void {
        this._isDirty = true;
    }

    /**
     * @return True, if this query can be serialized to an SQL string
     */
    get isComplete() : boolean {
        return (this.isCompleteImpl());
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
     * Serializes the whole query to the "over-the-wire" format.
     * @return The "over-the-wire" JSON representation
     */
    public toModel() : Model.Query {
        // Fill in basic information
        let toReturn : Model.Query = {
            name : this._name,
            id : this._id
        };

        // And let the deriving classes do the hard work
        toReturn = this.toModelImpl(toReturn);
        
        return (toReturn);
    }

    /**
     * Called in deriving methods to actually construct the model.
     * 
     * @param toReturn The model that will be returned and needs to be enriched.
     */
    protected abstract toModelImpl(toReturn : Model.Query) : Model.Query;


    /**
     * Each query-type needs to see for his own how to remove 
     * SQL-components.
     */
    abstract removeChild(formerChild : SyntaxTree.Removable) : void;
}

/**
 * A query that provides a WHERE component
 */
export interface QueryWhere extends Query {
    where : SyntaxTree.Where
}

/**
 * A query that provides a FROM component. Practically this should be
 * the case for most of the queries that are written using esqulino,
 * but theoretically it could be missing.
 */
export interface QueryFrom extends Query {
    from : SyntaxTree.From
}

/**
 * A query that reads data, but never mutates anything.
 */
export class QuerySelect extends Query implements QueryFrom, QueryWhere {

    private _select : SyntaxTree.Select;
    private _from   : SyntaxTree.From;
    private _where  : SyntaxTree.Where;

    constructor(schema : Table[], model : Model.Query) {
        super(schema, model);

        // Ensure that the model is valid
        if (!model.select) {
            throw { "err" : "QuerySelect without Select model" }
        }

        if (!model.from) {
            throw { "err" : "QuerySelect without From model" }
        }

        // Build SQL components from model
        this._select = new SyntaxTree.Select(model.select);
        this._from = new SyntaxTree.From(model.from);

        if (model.where) {
            this._where = new SyntaxTree.Where(model.where, this);
        }
    }

    /**
     * @return True, if all existing components are complete
     */
    protected isCompleteImpl() {
        return (this._select.isComplete &&
                this._from.isComplete &&
                (!this.where || this.where.isComplete));
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
            throw { "err" : "WHERE clause already present" }
        }

        this._where = where;
        this.markDirty();
    }

    /**
     * Calculates the SQL String representation of this query.
     */
    protected toSqlStringImpl() : string {
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
    protected toModelImpl(toReturn : Model.Query) : Model.Query {
        toReturn.from = this._from.toModel();
        toReturn.select = this._select.toModel();

        if (this._where) {
            toReturn.where = this._where.toModel();
        }
        
        return (toReturn);
    }
}

/**
 * An SQL DELETE query.
 */
export class QueryDelete extends Query implements QueryFrom, QueryWhere {
    private _delete : SyntaxTree.Delete;
    private _from   : SyntaxTree.From;
    private _where  : SyntaxTree.Where;

    constructor(schema : Table[], model : Model.Query) {
        super(schema, model);

        // Ensure that the model is valid
        if (!model.delete) {
            throw { "err" : "QuerySelect without Delete model" }
        }

        if (!model.from) {
            throw { "err" : "QuerySelect without From model" }
        }

        // Build SQL components from model
        this._delete = new SyntaxTree.Delete(model.delete);
        this._from = new SyntaxTree.From(model.from);

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
            throw { "err" : "WHERE clause already present" }
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
    protected isCompleteImpl() {
        return (this._delete.isComplete &&
                this._from.isComplete &&
                (!this._where || this._where.isComplete));
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
    protected toModelImpl(toReturn : Model.Query) : Model.Query {
        toReturn.delete = this._delete.toModel();
        toReturn.from = this._from.toModel();

        if (this._where) {
            toReturn.where = this._where.toModel();
        }

        return (toReturn);
    }
}

/**
 * Maps the given model to the correct type of query.
 *
 * @param toLoad The model to load
 *
 * @return A correct instance of a Query
 */
export function loadQuery(schema : Table[], toLoad : Model.Query) : Query {
    // The number of distinctive top-level components that
    // are present in the model.
    let topLevelList = [toLoad.delete, toLoad.select]
        .filter( v => !!v);

    // There must be a single top-level component
    if (topLevelList.length !== 1) {
        throw { "err" : `There must be a single top level component, got ${topLevelList.length}` }
    }

    // From here on we are sure, that only a single to level element is set
    if (toLoad.select) {
        return (new QuerySelect(schema, toLoad));
    }
    else if (toLoad.delete) {
        return (new QueryDelete(schema, toLoad));
    }

    throw { "err" : "Unknown top-level component" }
}
