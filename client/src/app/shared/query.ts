import {Schema}                          from './schema'
import {Project}                         from './project'
import {CURRENT_API_VERSION}             from './resource.description'

import {ValidationResult, Validateable}  from './query/validation'
import {
    Model, SyntaxTree, Query, ResultColumn
} from './query/base'
import {
    SelectQueryResult, QueryRunErrorDescription
} from './query/result'


export {
    Model, SyntaxTree, ValidationResult, Validateable,
    Query, ResultColumn,
    SelectQueryResult, QueryRunErrorDescription,
    CURRENT_API_VERSION
}

/**
 * Maps the given model to the correct type of query.
 *
 * @param toLoad The model to load
 *
 * @return A correct instance of a Query
 */
export function loadQuery(toLoad : Model.QueryDescription, schema : Schema, project : Project) : Query {
    return (new Query(schema, toLoad));
}


