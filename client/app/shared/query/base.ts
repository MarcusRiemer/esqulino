import {Project}                              from '../project'
import {ProjectResource}                      from '../resource'

import {Schema}                               from '../schema'
import {ValidationResult, Validateable}       from './validation'
import * as Model                             from './description'
import * as SyntaxTree                        from './syntaxtree'

export {Model, SyntaxTree}

/**
 * Facade for a query that allows meaningful mapping to the UI.
 */
export abstract class Query extends ProjectResource implements SyntaxTree.RemovableHost, Validateable {
    
    public schema : Schema;

    /**
     * Stores all basic information about a string.
     */
    constructor(schema : Schema, model : Model.QueryDescription, project : Project = undefined) {
        super(model.id, model.name, project);
        this.schema = schema;
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
     * Serializes the whole query to the "over-the-wire" format.
     * @return The "over-the-wire" JSON representation
     */
    public toModel() : Model.QueryDescription {
        // Fill in basic information
        let toReturn : Model.QueryDescription = {
            name : this.name,
            id : this.id
        };

        // And let the deriving classes do the hard work
        toReturn = this.toModelImpl(toReturn);
        
        return (toReturn);
    }

    /**
     * Called in deriving methods to actually construct the model.
     * 
     * @param toReturn The model that will be returned and needs to be enriched.
     *
     * @return The enriched model
     */
    protected abstract toModelImpl(toReturn : Model.QueryDescription) : Model.QueryDescription;

    /**
     * Each query-type needs to see for his own how to remove 
     * SQL-components. Sometimes this is possible (WHERE), sometimes
     * it should be disallowed (FROM).
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
 * Describes the column of a result in detail.
 */
export interface ResultColumn {
    // The query this column is part of
    query : Query
    
    fullName : string
    shortName : string
}
