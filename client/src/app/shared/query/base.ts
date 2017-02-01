import {Project}                              from '../project'
import {ProjectResource, CURRENT_API_VERSION} from '../resource'

import {Schema}                               from '../schema'
import {
    Validateable, ValidationResult, ValidationError, ValidationErrors
} from './validation'
import * as Model                             from './description'
import * as SyntaxTree                        from './syntaxtree'

export {Model, SyntaxTree, CURRENT_API_VERSION}

/**
 * Facade for a query that allows meaningful mapping to the UI.
 */
export abstract class Query extends ProjectResource implements SyntaxTree.RemovableHost, Validateable {
    
    public schema : Schema;

    /**
     * True, if this query always returns a single row.
     */
    private _singleRow : boolean = false;

    /**
     * Stores all basic information about a string.
     */
    constructor(schema : Schema, model : Model.QueryDescription, project? : Project) {
        super(project, model);
        this.schema = schema;
        this._singleRow = !!model.singleRow;
    }

    /**
     * It doesn't seem very sensible to have this operation, but it allows
     * implementers of the `ExpressionParent` interface (which quite a few
     * descending classes need to implement) to stop recursion.
     */
    get query() : Query {
        return (this);
    }


    /**
     * @return True, if this query always returns a single row
     */
    get singleRow() : boolean {
        return (this._singleRow);
    }

    /**
     * @param value True, if this query always returns a single row
     */
    set singleRow(value : boolean) {
        this._singleRow = value;
        this.markSaveRequired();
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
     * @return All parameters of this query.
     */
    get parameters() : SyntaxTree.ParameterExpression[] {
        return (this.getLeaves().filter(e => e instanceof SyntaxTree.ParameterExpression) as SyntaxTree.ParameterExpression[] )
    }

    /**
     * @return True, if this query has any parameters.
     */
    get hasParameters() : boolean {
        return (this.parameters.length > 0);
    }

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
        const ownErrors : ValidationError[] = [];

        // Ensure there is a WHERE condition if this query promises to
        // deliver a single row.
        if (this.singleRow) {
            const where : QueryWhere = (this as any).where;

            if (!where) {
                ownErrors.push(new ValidationErrors.UnplausibleSingleRow(true));
            }
        }

        return (new ValidationResult(ownErrors, [this.validateImpl(this.schema)]));
    }
    
    /**
     * @return True, if this query is actually valid.
     */
    get isValid() : boolean {
        return (this.validate().isValid);
    }

    /**
     * @return The "over-the-wire" JSON representation
     */
    public toModel() : Model.QueryDescription {
        // Fill in basic information
        let toReturn : Model.QueryDescription = {
            name : this.name,
            id : this.id,
            apiVersion : this.apiVersion
        };

        // Fill in the optional singleRow annotation
        if (this.singleRow) {
            toReturn.singleRow = this.singleRow;
        }

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

    // The fully qualified name of this column. For columns of
    // tables this means there is a table prefix, for columns
    // that are actually an expression this is the string
    // representation of the expression.
    fullName : string

    // The shorthand-name of this column. If the column has an
    // alias this acts as the short name.
    shortName : string

    // The expression that results in this column. Careful: This
    // may be a StarExpression.
    expr : SyntaxTree.Expression
}