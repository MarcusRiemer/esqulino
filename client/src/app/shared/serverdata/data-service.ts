import { HttpClient, HttpParams } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable, BehaviorSubject } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { IdentifiableResourceDescription } from '../resource.description';

import { JsonApiListResponse, isJsonApiListResponse } from './json-api-response'
import { CachedRequest, IndividualDescriptionCache } from './request-cache';

/**
 * Basic building block to access "typically" structured data from the server.
 * May additionally also provide a local cache for objects that need to be
 * persisted across multiple components.
 */
export abstract class DataService<
  TList extends IdentifiableResourceDescription,
  TSingle extends IdentifiableResourceDescription> {

  // These parameters are passed to every listing request
  private _listGetParams = new HttpParams();

  private _listTotalCount = new BehaviorSubject<number | undefined>(undefined);

  // Backing field for local cache, (obviously) not persisted between browser
  // sessions
  private _localCache: { [id: string]: TSingle } = {};

  public constructor(
    protected _http: HttpClient,
    private _snackBar: MatSnackBar,
    private _listUrl: string,
    private _speakingName: string,
  ) {
  }

  /**
   * The cache of all descriptions that are available to the current user.
   */
  readonly listCache = new CachedRequest<TList[]>(this.createListRequest());

  /**
   * The individually cached resources.
   */
  protected readonly _individualCache = new IndividualDescriptionCache<TSingle>(
    this._http,
    id => this.resolveIndividualUrl(id)
  );

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

  /**
   * Calculates the URL that can be used to retrieve the resource in question.
   *
   * @param id The ID of the resource to retrieve.
   * @return The URL that can be used to retrieve the resource in question.
   */
  protected abstract resolveIndividualUrl(id: string): string;

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
  setListOrdering(columnName: string, order: "asc" | "desc" | "") {
    if (order === "") {
      this._listGetParams = this._listGetParams
        .delete("orderDirection")
        .delete("orderField");
    } else {
      this._listGetParams = this._listGetParams
        .set("orderDirection", order)
        .set("orderField", columnName);
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

  /**
   * @param id The id of the searched resource
   * @param refresh True, if the cache must be updated
   *
   * @return The details of the specified resource.
   */
  getSingle(id: string, refresh = false): Observable<TSingle> {
    if (refresh) {
      this._individualCache.refreshDescription(id);
    }

    return (this._individualCache.getDescription(id));
  }

  /**
   * Updates an individual resource on the server. Uses the same
   * URL as the individual data access, but with HTTP PUT.
   */
  updateSingle(desc: TSingle, showErrorFeedback = true): Promise<TSingle> {
    const toReturn = new Promise<TSingle>((resolve, reject) => {
      this._http.put<TSingle>(this.resolveIndividualUrl(desc.id), desc)
        .pipe(first())
        .subscribe(updatedDesc => {
          console.log(`Updated ${this._speakingName} with ID "${desc.id}"`);
          this._snackBar.open(`Updated ${this._speakingName} with ID "${desc.id}"`, "", { duration: 3000 });
          this.listCache.refresh();
          resolve(updatedDesc);
        }, err => {
          console.warn(`Update failed: ${this._speakingName} with ID "${desc.id}"`);

          if (showErrorFeedback) {
            this._snackBar.open(`Could not update ${this._speakingName} with ID "${desc.id}"`, "OK 😞");
          } else {
            reject(err);
          }
        });
    });

    return (toReturn);
  }

  /**
   * Deletes a individual server on the server. Uses the same
   * URL as the individual data access, but with HTTP DELETE.
   *
   * @param id The ID of the resouce.
   */
  deleteSingle(id: string, showErrorFeedback = true): Promise<void> {
    const toReturn = new Promise<void>((resolve, reject) => {

      this._http.delete(this.resolveIndividualUrl(id))
        .pipe(first())
        .subscribe(_ => {
          console.log(`Deleted ${this._speakingName} with  "${id}"`);
          this._snackBar.open(`Deleted ${this._speakingName} with ID "${id}"`, "", { duration: 3000 });
          this.listCache.refresh();

          resolve();
        }, err => {
          console.warn(`Delete failed: ${this._speakingName} with ID "${id}"`);
          if (showErrorFeedback) {
            this._snackBar.open(`Could not delete ${this._speakingName} with ID "${id}"`, "OK 😞");
          } else {
            reject(err);
          }
        });
    });

    return (toReturn);
  }

  /**
   * @param id The ID of the item to retrieve from cache
   * @param onMissing What to do if the item does not exist: Issue a request or return `undefined`
   * @return A locally cached version of the given resource
   */
  async getLocal(id: string, onMissing: "request" | "undefined" = "undefined") {
    let toReturn = this._localCache[id];
    if (!toReturn && onMissing === "request") {
      // Without taking only the first item from `getSingle`, the promise
      // will never be fulfilled
      toReturn = await this.getSingle(id).pipe(first()).toPromise();
      this.setLocal(toReturn);
    }

    return (toReturn);
  }

  /**
   * @param res The resource to cache locally
   */
  setLocal(res: TSingle) {
    console.log(`Item with id ${res.id} added to cache: `, res);
    this._localCache[res.id] = res;
  }
}