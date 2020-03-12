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
    return (this._listTotalCount.value);
  }

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
   * lists of data. This is useful for pagination and sorting.
   */
  private changeListParameters(newParams: HttpParams) {
    this._listGetParams = newParams;
    this.listCache.refresh(this.createListRequest())
  }

  /**
   * Set the ordering parameters that should be used for all subsequent
   * listing requests.
   */
  setListOrdering(columnName: keyof TList, order: "asc" | "desc" | "") {
    if (order === "") {
      this._listGetParams = this._listGetParams
        .delete("orderDirection")
        .delete("orderField");
    } else {
      this._listGetParams = this._listGetParams
        .set("orderDirection", order)
        .set("orderField", columnName.toString());
    }

    this.changeListParameters(this._listGetParams);
  }

  /**
   * Set the limits that should be used for all subsequent listing requests.
   */
  setListPagination(pageSize: number, currentPage: number) {
    this._listGetParams = this._listGetParams.set("limit", pageSize.toString());
    this._listGetParams = this._listGetParams.set("offset", (pageSize * currentPage).toString());

    this.changeListParameters(this._listGetParams);
  }
}