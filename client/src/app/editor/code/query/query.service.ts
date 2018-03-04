import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable'

import {
  ArbitraryQueryRequestDescription, QueryParamsDescription, QueryResponseDescription
} from '../../../shared/syntaxtree/sql/query.description';
import { ServerApiService } from '../../../shared/serverapi.service';
import { Node, CodeResource } from '../../../shared/syntaxtree';

/**
 * A nicely wrapped result of a query.
 */
export class QueryResult {
  public columns: string[];
  public rows: string[][];

  constructor(desc: QueryResponseDescription) {
    this.columns = desc.columns;
    this.rows = desc.rows;
  }
}


/**
 * Allows interaction with the query specific operations
 * of the server.
 */
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
   * Sends the AST of the given resource to the server in order to execute
   * it over there.
   *
   * @param sqlResource A code resource that compiles to SQL.
   * @param params The parameters to run this query.
   */
  runArbitraryQuery(sqlResource: CodeResource, params: QueryParamsDescription) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    const url = this._server.getRunQueryUrl(sqlResource.project.slug);

    const body: ArbitraryQueryRequestDescription = {
      ast: sqlResource.syntaxTreePeek.toModel(),
      params: params
    };

    const toReturn = this._http.post(url, JSON.stringify(body), options)
      .catch(this.handleError)
      .delay(500)
      .map(res => new QueryResult(res.json()))

    return (toReturn);
  }

  private handleError(error: Response) {
    // in a real world app, we may send the error to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error);
    return Observable.throw(error);
  }
}
