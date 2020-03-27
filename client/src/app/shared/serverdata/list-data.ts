import { HttpClient, HttpParams } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { IdentifiableResourceDescription } from '../resource.description';

import { JsonApiListResponse, isJsonApiListResponse } from './json-api-response'
import { CachedRequest } from './request-cache';

/**
 * Basic building block to access "typically" structured data from the server.
 * May additionally also provide a local cache for objects that need to be
 * persisted across multiple components.
 */
export class ListData<TList extends IdentifiableResourceDescription> {

  public constructor(
    // Deriving classes may need to make HTTP requests of their own
    protected _http: HttpClient,
    private _listUrl: string,
  ) {
  }

  // These parameters are passed to every listing request
  private _listGetParams = new HttpParams();

  private readonly _listTotalCount = new BehaviorSubject<number | undefined>(undefined);

  /**
   * The cache of all descriptions that are available to the current user.
   */
  readonly listCache = new CachedRequest<TList[]>(this.createListRequest());

  /**
   * An observable of all descriptions that are available to the current user.
   */
  readonly list = this.listCache.value;

  /**
   * @return The total number of list items available.
   */
  get peekListTotalCount() {
    return (this._listTotalCount.value)
  };

  readonly listTotalCount = this._listTotalCount.asObservable();

  private createListRequest() {
    return this._http.get<TList[] | JsonApiListResponse<TList>>(this._listUrl, {
      params: this._listGetParams
    }).pipe(
      map(response => {
        if (isJsonApiListResponse<TList>(response)) {
          this._listTotalCount.next(response.meta.totalCount);
          return (response.data);
        } else {
          this._listTotalCount.next(undefined);
          return (response);
        }
      })
    );
  }

  /**
   * Change the parameters that are passed to the HTTP GET requests for
   * lists of data. This is used for pagination, sorting and possibly filtering.
   *
   * Per default changed parameters will result in a new request (and therfore an
   * updated list), but if many parameters are changed peu à peuit may be smarter
   * to only issue the new request once all parameters are known.
   *
   * @param newParams The new set of HTTP GET parameters that will be sent with every request.
   * @param refresh True, if a new request should be issued immediatly.
   */
  private changeListParameters(newParams: HttpParams, refresh: boolean = true) {
    this._listGetParams = newParams;
    if (refresh) {
      this.listCache.refresh(this.createListRequest());
    }
  }

  /**
   * Set the ordering parameters that should be used for all subsequent
   * listing requests.
   */
  setListOrdering(columnName: keyof TList, order: "asc" | "desc" | "", refresh: boolean = true) {
    let newParams = (order === "")
      ? this._listGetParams
        .delete("orderDirection")
        .delete("orderField")
      : this._listGetParams
        .set("orderDirection", order)
        .set("orderField", columnName.toString());

    this.changeListParameters(newParams, refresh);
  }

  /**
   * Set the limits that should be used for all subsequent listing requests.
   */
  setListPagination(pageSize: number, currentPage: number, refresh: boolean = true) {
    const newParams = this._listGetParams
      .set("limit", pageSize.toString())
      .set("offset", (pageSize * currentPage).toString());

    this.changeListParameters(newParams, refresh);
  }
}