import {Schema}                          from '../schema'
import {ValidationResult, Validateable}  from '../query.validation'
import * as Model                        from '../query.model'
import * as SyntaxTree                   from '../query.syntaxtree'

/**
 * Facade for a query that allows meaningful mapping to the UI.
 */
export abstract class Query implements SyntaxTree.RemovableHost, Validateable {
    public schema : Schema;
    private model : Model.QueryDescription;
    
    private _isDirty = false;

    private _name : string;
    private _id   : string;

    /**
     * Stores all basic information about a string.
     */
    constructor(schema : Schema, model : Model.QueryDescription) {
        this._name = model.name;
        this._id = model.id;

        this.schema = schema;
        this.model = model;
    }

    /**
     * @return The schema definition of a table with the given name.
     */
    getTableSchema(name : string) {
        return (this.schema.getTable(name));
    }

    /**
     * @return True, if this query could be serialized to SQL.
     */
    protected abstract validateImpl(schema : Schema) : ValidationResult;

    /**
     * @return The SQL representation of this query.
     */
    protected abstract toSqlStringImpl() : string;

    /**
     * @return All expressions that are leaves of the expression tree.
     */
    abstract getLeaves() : SyntaxTree.Expression[];

    /**
     * Retrieves the SQL representation of this query.
     *
     * @return An SQL string that represents this query.
     */
    toSqlString() : string {
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
     * @return A validation report
     */
    validate() : ValidationResult {
        return (this.validateImpl(this.schema));
    }
    
    /**
     * @return True, if this query is actually valid.
     */
    get isValid() : boolean {
        return (this.validate().isValid);
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
        this.markDirty();
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
    public toModel() : Model.QueryDescription {
        // Fill in basic information
        let toReturn : Model.QueryDescription = {
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
    protected abstract toModelImpl(toReturn : Model.QueryDescription) : Model.QueryDescription;


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
