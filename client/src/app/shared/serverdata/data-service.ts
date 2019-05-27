import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { CachedRequest, IndividualDescriptionCache } from './request-cache';

/**
 * Basic building block to access "typically" structured data from the server.
 */
export abstract class DataService<TList, TSingle> {
  public constructor(
    protected _http: HttpClient,
    private _listUrl: string,
  ) {
  }

  /**
   * The cache of all descriptions that are available to the current user.
   */
  readonly listCache = new CachedRequest<TList[]>(
    this._http.get<TList[]>(this._listUrl)
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
}