import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs'
import { catchError, delay, map } from 'rxjs/operators';

import {
  ArbitraryQueryRequestDescription, QueryParamsDescription, QueryResponseDescription
} from '../../../shared/syntaxtree/sql/query.description';
import { ServerApiService } from '../../../shared/serverapi.service';
import { Node, CodeResource } from '../../../shared/syntaxtree';

export { QueryParamsDescription }

/**
 * A nicely wrapped result of a query.
 */
export class QueryResult {
  public readonly columns: string[];
  public readonly rows: string[][];
  public readonly totalCount: number | "unknown";

  constructor(desc: QueryResponseDescription) {
    this.columns = desc.columns;
    this.rows = desc.rows;
    this.totalCount = desc.totalCount;
  }

  /**
   * @return The number of rows in this result.
   */
  get rowCount() {
    return (this.rows.length);
  }

  /**
   * @return True, if the result is only a partial result.
   */
  get isPartial() {
    return (!this.hasKnownCount || this.rows.length < this.totalCount);
  }

  /**
   * @return True, if the size of the result set is known.
   */
  get hasKnownCount() {
    return (this.totalCount !== "unknown");
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
      .pipe(
        catchError(this.handleError),
        delay(500),
        map(res => new QueryResult(res.json()))
      );

    return (toReturn);
  }

  private handleError(error: Response) {
    // in a real world app, we may send the error to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error);
    return Observable.throw(error);
  }
}
