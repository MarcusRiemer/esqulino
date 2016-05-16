import {Injectable}                              from '@angular/core'
import {Http, Response, Headers, RequestOptions} from '@angular/http'

import {BehaviorSubject}                         from 'rxjs/BehaviorSubject'
import {AsyncSubject}                            from 'rxjs/AsyncSubject'
import {Observable}                              from 'rxjs/Observable'

import {ServerApiService}                        from '../shared/serverapi.service'
import {ProjectDescription}                      from '../shared/project.description'
import {
    Model, Query, QuerySelect, QueryDelete, QueryInsert, QueryUpdateRequestDescription,
} from '../shared/query'
import {
    QueryResult, QueryRunErrorDescription
} from '../shared/query.result'

import {Project}                                 from './project'

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
     * Request to create a new query on the given table.
     *
     * @param table The name of the table to query initially
     */
    createSelect(project : Project, table : string) {
        const url = this._server.getQueryUrl(project.id);

        let model : Model.QueryDescription = {
            id : undefined,
            name : table,
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

        const query = new QuerySelect(project.schema, model);
        
        let bodyJson : QueryUpdateRequestDescription = {
            model : model,
            sql : query.toSqlString()
        }
        
        const request = this._http.post(url, JSON.stringify(bodyJson))
            .catch(this.handleError);

        const toReturn = new AsyncSubject<QuerySelect>();

        // Once the query has been created, add it to the list of queries
        // that are part of this project.
        request.subscribe( queryId => {
            model.id = queryId.text();

            const newQuery = new QuerySelect(project.schema, model);
            project.queries.push(newQuery);

            toReturn.next(newQuery);
        });

        return (toReturn);
    }

    /**
     * Request to create a new query on the given table.
     *
     * @param table The name of the table to query initially
     */
    createInsert(project : Project, tableName : string) {
        const url = this._server.getQueryUrl(project.id);

        let model : Model.QueryDescription = {
            id : undefined,
            name : tableName,
            insert : {
                table : tableName,
                columns : [],
                values : []
            }
        }

        const query = new QueryInsert(project.schema, model);
        
        let bodyJson : QueryUpdateRequestDescription = {
            model : model,
            sql : query.toSqlString()
        }
        
        const request = this._http.post(url, JSON.stringify(bodyJson))
            .catch(this.handleError);

        const toReturn = new AsyncSubject<QueryInsert>();

        // Once the query has been created, add it to the list of queries
        // that are part of this project.
        request.subscribe( queryId => {
            model.id = queryId.text();

            const newQuery = new QueryInsert(project.schema, model);
            project.queries.push(newQuery);

            // And inform the caller
            toReturn.next(newQuery);
        });

        return (toReturn);
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
