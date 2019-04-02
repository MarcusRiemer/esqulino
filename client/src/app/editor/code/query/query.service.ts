import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Observable, of } from 'rxjs'
import { catchError, delay, map } from 'rxjs/operators';

import {
  ArbitraryQueryRequestDescription, QueryParamsDescription, QueryResponseDescription
} from '../../../shared/syntaxtree/sql/query.description';
import { ServerApiService } from '../../../shared';
import { CodeResource } from '../../../shared/syntaxtree';

export { QueryParamsDescription }

/**
 * A nicely wrapped result of a query.
 */
export class QueryResultRows {
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

export class QueryResultError {
  constructor(public readonly data: DatabaseQueryErrorDescription) { }
}

export type QueryResult = QueryResultRows | QueryResultError;


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
    private _http: HttpClient,
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
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const url = this._server.getRunQueryUrl(sqlResource.project.slug);

    const body: ArbitraryQueryRequestDescription = {
      ast: sqlResource.syntaxTreePeek.toModel(),
      params: params
    };

    const toReturn: Observable<QueryResult> =
      this._http.post<QueryResponseDescription>(url, JSON.stringify(body), {
        headers: headers
      })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            const errorData = error.error as DatabaseQueryErrorDescription;
            return (of(new QueryResultError(errorData)));
          }),
          delay(500),
          map(res => res instanceof QueryResultError ? res : new QueryResultRows(res))
        );

    return (toReturn);
  }
}
