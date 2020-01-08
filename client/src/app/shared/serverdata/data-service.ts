import { HttpClient, HttpParams } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable } from 'rxjs';

import { CachedRequest, IndividualDescriptionCache } from './request-cache';
import { first } from 'rxjs/operators';
import { IdentifiableResourceDescription } from '../resource.description';

/**
 * Basic building block to access "typically" structured data from the server.
 */
export abstract class DataService<
  TList extends IdentifiableResourceDescription,
  TSingle extends IdentifiableResourceDescription> {

  private _listGetParams = new HttpParams();

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
  readonly listCache = new CachedRequest<TList[]>(
    this._http.get<TList[]>(this._listUrl, {
      params: this._listGetParams
    })
  );

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
   * Calculates the URL that can be used to retrieve the resource in question.
   *
   * @param id The ID of the resource to retrieve.
   * @return The URL that can be used to retrieve the resource in question.
   */
  protected abstract resolveIndividualUrl(id: string): string;

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
   * Change the parameters that are passed to the HTTP GET requests for
   * lists of data. This is useful for pagination and sorting.
   */
  changeListParameters(newParams: HttpParams) {
    this._listGetParams = newParams;
    // TODO: This is redundant, see initialisation of listCache
    this.listCache.refresh(
      this._http.get<TList[]>(this._listUrl, {
        params: this._listGetParams
      })
    )
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
}