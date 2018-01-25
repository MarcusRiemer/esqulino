import { Injectable } from '@angular/core'
import { Http, Response, Headers, RequestOptions } from '@angular/http'

import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { AsyncSubject } from 'rxjs/AsyncSubject'
import { Observable } from 'rxjs/Observable'

import { ServerApiService, CURRENT_API_VERSION } from '../shared/'
import {
  Model, loadQuery, QueryTypeSimulation,
  Query, QueryResult, QueryRunErrorDescription,
} from '../shared/query'

import { Project, ProjectDescription } from './project.service'
import { ArbitraryQueryRequestDescription, QueryParamsDescription, QueryUpdateRequestDescription } from './query.service.description'

export { QueryParamsDescription }

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
    private _http: Http,
    private _server: ServerApiService
  ) {
  }

  /**
   * Stores the description of the given project on the server. This will
   * not store any queries or pages, just the user facing description.
   *
   * @param proj The project with the relevant description.
   */
  storeProjectDescription(proj: Project) {
    const desc = proj.toModel();
    const url = this._server.getProjectUrl(proj.slug);

    const toReturn = this._http.post(url, JSON.stringify(desc))
      .catch(this.handleError);

    return (toReturn);
  }

  /**
   * Sends a certain query to the server to be executed.
   */
  runQuery(project: Project, query: Query, params: QueryParamsDescription) {
    const url = this._server.getRunQueryUrl(project.slug);
    return (this.serverCallQueryEndpoint(url, query, params, false));
  }

  /**
   * Simulates the effect of a query
   */
  simulateQuery(project: Project, query: Query, params: QueryParamsDescription) {
    const url = this.urlForSimulation(query.simulationType, project.slug);
    return (this.serverCallQueryEndpoint(url, query, params, true));
  }

  /**
   * Retrieves the URL that should be used to simulate a query.
   */
  private urlForSimulation(type: QueryTypeSimulation, projectId: string): string {
    switch (type) {
      case "insert": return (this._server.getSimulateInsertUrl(projectId));
      case "delete": return (this._server.getSimulateDeleteUrl(projectId));
      default:
        throw new Error(`Can not determine simulation URL for query of type "${type}"`);
    }
  }

  private serverCallQueryEndpoint(url: string, query: Query, params: QueryParamsDescription, simulated: boolean) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    const body = {
      sql: query.toSqlString(),
      params: params
    }

    const toReturn = this._http.post(url, JSON.stringify(body), options)
      .catch((error: any) => {
        return (Observable.of(error));
      })
      .map((res) => {
        // The result changes dependending on the concrete type
        // of the query.
        if (query.select || query.insert || query.delete) {
          return (new QueryResult(query, <any>res.json(), simulated))
        } else {
          return (undefined);
        }
      });

    return (toReturn);
  }

  /**
   * Request to save a certain query.
   */
  saveQuery(project: Project, query: Query) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    const url = this._server.getQuerySpecificUrl(project.slug, query.id);

    let bodyJson: QueryUpdateRequestDescription = {
      model: query.toModel()
    }

    // Add the SQL representation, if applicable
    if (query.validate().isValid) {
      bodyJson.sql = query.toSqlString();
    }

    // Id is part of the URL
    delete bodyJson.model.id;

    const body = JSON.stringify(bodyJson);

    const toReturn = this._http.post(url, body, options)
      .map((res) => "")
      .do(_ => query.markSaved())
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
  createQuery(project: Project,
    queryType: string,
    name: string,
    table: string): AsyncSubject<Query> {
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
   * @param project The project the response should be added to
   *
   * @return An AsyncSubject that is fired once the query is part of the project
   */
  private handleCreationResponse(model: Model.QueryDescription,
    project: Project) {
    const url = this._server.getQueryUrl(project.slug);

    const query = loadQuery(model, project.schema, project);
    let bodyJson: QueryUpdateRequestDescription = {
      model: model,
      sql: query.toSqlString()
    }

    const request = this._http.post(url, JSON.stringify(bodyJson));
    request.catch(this.handleError);

    const toReturn = new AsyncSubject<Query>();

    // Once the query has been created, add it to the list of queries
    // that are part of this project.
    request.subscribe(queryId => {
      // Use the server-assigned id
      model.id = queryId.text();

      // Load the query and append it to the model
      const newQuery = loadQuery(model, project.schema, project);
      project.addQuery(newQuery);

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
   * @param project The project this query belongs to.
   * @param table The name of the table to query initially
   */
  createSelect(project: Project, queryName: string, table: string) {
    // Build the initial model
    let model: Model.QueryDescription = {
      id: undefined,
      name: queryName,
      apiVersion: CURRENT_API_VERSION,
      select: {
        columns: [{
          expr: {
            star: {}
          }
        }]
      },
      from: {
        first: {
          name: table
        }
      }
    }

    return (this.handleCreationResponse(model, project));
  }

  /**
   * Request to create a new DELETE query on the given table.
   */
  createDelete(project: Project, queryName: string, table: string) {
    // Build the initial model
    let model: Model.QueryDescription = {
      id: undefined,
      name: queryName,
      apiVersion: CURRENT_API_VERSION,
      delete: {},
      from: {
        first: {
          name: table
        }
      }
    }

    return (this.handleCreationResponse(model, project));
  }

  /**
   * Request to create a new query on the given table.
   *
   * @param project The project this query belongs to.
   * @param queryName The name of the query itself
   * @param table The name of the table to query initially
   */
  createInsert(project: Project, queryName: string, tableName: string) {
    // Build the initial model
    let model: Model.QueryDescription = {
      id: undefined,
      name: queryName,
      apiVersion: CURRENT_API_VERSION,
      insert: {
        table: tableName,
        assignments: []
      }
    }

    return (this.handleCreationResponse(model, project));
  }

  /**
   * Request to create a new query on the given table.
   *
   * @param project The project this query belongs to.
   * @param queryName The name of the query itself
   * @param table The name of the table to query initially
   */
  createUpdate(project: Project, queryName: string, tableName: string) {
    // Build the initial model
    let model: Model.QueryDescription = {
      id: undefined,
      name: queryName,
      apiVersion: CURRENT_API_VERSION,
      update: {
        table: tableName,
        assignments: []
      }
    }

    return (this.handleCreationResponse(model, project));
  }

  /**
   * Requests to delete a query.
   *
   * @param project The project this query belongs to.
   * @param queryId The id of the query to delete
   */
  deleteQuery(project: Project, queryId: string) {
    const url = this._server.getQuerySpecificUrl(project.slug, queryId);

    const toReturn = this._http.delete(url)
      .catch(this.handleError);

    toReturn.subscribe(res => {
      project.removeQueryById(queryId);
    });
  }

  private handleError(error: Response) {
    // in a real world app, we may send the error to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error);
    return Observable.throw(error);
  }
}
