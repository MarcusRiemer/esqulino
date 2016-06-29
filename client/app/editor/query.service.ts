import {Injectable}                              from '@angular/core'
import {Http, Response, Headers, RequestOptions} from '@angular/http'

import {BehaviorSubject}                         from 'rxjs/BehaviorSubject'
import {AsyncSubject}                            from 'rxjs/AsyncSubject'
import {Observable}                              from 'rxjs/Observable'

import {ServerApiService}                        from '../shared/serverapi.service'
import {ProjectDescription}                      from '../shared/project.description'
import {
    Model, loadQuery,
    Query, QuerySelect, QueryDelete, QueryInsert
} from '../shared/query'
import {
    QueryResult, QueryRunErrorDescription
} from '../shared/query.result'

import {Project}                                 from './project'

/**
 * Storing a query on the server
 */
export interface QueryUpdateRequestDescription {
    model : Model.QueryDescription,
    sql? : string
}

/**
 * Parameters are simply a key-value dictionary. Whenever a query
 * makes use of user-bound parameters, these are transferred via
 * this kind of object.
 */
export type QueryParamsDescription = { [paramKey:string] : string }

/**
 * Some servers support execution of arbitrary queries. This is intended
 * to be used during development and can be done via this request-type.
 */
export type ArbitraryQueryRequestDescription = {
    params : QueryParamsDescription
    sql : string
}

/**
 * Provides means to communicate with a server that can store or run
 * queries.
 */
@Injectable()
export class QueryService {
    
    /**
     * @param _http Used to do HTTP requests
     * @param _server Used to figure out paths for HTTP requests
     */
    constructor(
        private _http : Http,
        private _server : ServerApiService
    ) {
    }

    /**
     * Stores the description of the given project on the server. This will
     * not store any queries or pages, just the user facing description.
     *
     * @param proj The project with the relevant description.
     */
    storeProjectDescription(proj : Project) {
        const desc = proj.toModel();
        const url = this._server.getProjectUrl(proj.id);

        const toReturn = this._http.post(url, JSON.stringify(desc))
            .catch(this.handleError);

        return (toReturn);
    }
    
    /**
     * Sends a certain query to the server to be executed.
     */
    runQuery(project : Project, query : Query) {
        const url = this._server.getRunQueryUrl(project.id);
        
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        const body = {
            sql : query.toSqlString(),
            params : { }
        }
        
        const toReturn = this._http.post(url, JSON.stringify(body), options)
            .catch( (error : any) => {
                if (query instanceof Query) {
                    return (Observable.of(error));                
                } else {
                    return Observable.throw(error);
                }
            })
            .map( (res) =>  {
                // The result changes dependending on the concrete type
                // of the query.
                if (query instanceof QuerySelect) {
                    return (new QueryResult(query, <any> res.json()))
                } else if (query instanceof QueryInsert) {
                    // TODO: Create special result class for inserts
                    return (new QueryResult(undefined, <any> res.json()))
                }
            });

        return (toReturn);
    }
    
    /**
     * Request to save a certain query.
     */
    saveQuery(project : Project, query : Query) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        const url = this._server.getQuerySpecificUrl(project.id, query.id);

        let bodyJson : QueryUpdateRequestDescription = {
            model : query.toModel()
        }

        // Add the SQL representation, if applicable
        if (query.validate().isValid) {
            bodyJson.sql = query.toSqlString();
        }

        // Id is part of the URL
        delete bodyJson.model.id;

        const body = JSON.stringify(bodyJson);

        const toReturn = this._http.post(url, body, options)
            .map( (res) => "" )
            .catch(this.handleError);

        return (toReturn);
    }

    /**
     * Creates a new query.
     *
     * @param project The project this query belongs to.
     * @param queryType The type of the query to create.
     * @param name The name of the query.
     * @param table The initial table of the query.
     */
    createQuery(project : Project,
                queryType : string,
                name : string,
                table : string) : AsyncSubject<Query> {
        switch (queryType) {
        case "select":
            return (this.createSelect(project, name, table));
        case "insert":
            return (this.createInsert(project, name, table));
        case "delete":
            return (this.createDelete(project, name, table));
        case "update":
            return (this.createUpdate(project, name, table));

        default:
            throw new Error(`createQuery: unknown queryType "${queryType}"`);
        }
    }

    /**
     * Prepares a creation request for the given model, and
     * can handle the response.
     *
     * @param model   The model that was used to build the request
     * @param project The project the respons should be added to
     *
     * @return An AsyncSubject that is fired once the query is part of the project
     */
    private handleCreationResponse(model : Model.QueryDescription,
                                   project : Project) {
        const url = this._server.getQueryUrl(project.id);
        
        const query = loadQuery(project.schema, model);
        let bodyJson : QueryUpdateRequestDescription = {
            model : model,
            sql : query.toSqlString()
        }

        const request = this._http.post(url, JSON.stringify(bodyJson));
        request.catch(this.handleError);

        const toReturn = new AsyncSubject<Query>();

        // Once the query has been created, add it to the list of queries
        // that are part of this project.
        request.subscribe( queryId => {
            // Use the server-assigned id
            model.id = queryId.text();

            // Load the query and append it to the model
            const newQuery = loadQuery(project.schema, model);
            project.queries.push(newQuery);

            // And inform the listener about the new query, as this
            // is an AsyncSubject, the stream needs to be closed
            // explicitly.
            toReturn.next(newQuery);
            toReturn.complete();
        });

        return (toReturn);
    }

    /**
     * Request to create a new SELECT query on the given table.
     *
     * @param table The name of the table to query initially
     */
    createSelect(project : Project, queryName : string, table : string) {
        // Build the initial model
        let model : Model.QueryDescription = {
            id : undefined,
            name : queryName,
            select : {
                columns : [{
                    expr : {
                        star : { }
                    }
                }]
            },
            from : {
                first : {
                    name : table
                }
            }
        }

        return (this.handleCreationResponse(model, project));
    }

    /**
     * Request to create a new DELETE query on the given table.
     */
    createDelete(project : Project, queryName : string, table : string) {
        // Build the initial model
        let model : Model.QueryDescription = {
            id : undefined,
            name : queryName,
            delete : {},
            from : {
                first : {
                    name : table
                }
            }
        }

        return (this.handleCreationResponse(model, project));
    }

    /**
     * Request to create a new query on the given table.
     *
     * @param table The name of the table to query initially
     */
    createInsert(project : Project, queryName : string, tableName : string) {
        // Build the initial model
        let model : Model.QueryDescription = {
            id : undefined,
            name : queryName,
            insert : {
                table : tableName,
                assignments : []
            }
        }

        return (this.handleCreationResponse(model, project));
    }

    /**
     * Request to create a new query on the given table.
     *
     * @param table The name of the table to query initially
     */
    createUpdate(project : Project, queryName : string, tableName : string) {
        // Build the initial model
        let model : Model.QueryDescription = {
            id : undefined,
            name : queryName,
            update : {
                table : tableName,
                assignments : []
            }
        }

        return (this.handleCreationResponse(model, project));
    }

    deleteQuery(project : Project, queryId : string) {
        const url = this._server.getQuerySpecificUrl(project.id, queryId);

        const toReturn = this._http.delete(url)
            .catch(this.handleError);

        toReturn.subscribe( res => {
            project.removeQueryById(queryId);
        });
    }

    private handleError (error: Response) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error);
    }
}
