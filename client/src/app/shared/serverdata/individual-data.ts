import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";
import { first, tap } from "rxjs/operators";

import { IdentifiableResourceDescription } from "../resource.description";

import { IndividualDescriptionCache } from "./request-cache";
import { ResolveIndividualUrl } from "./url-resolve";

/**
 * Access individual resources from a server.
 */
export class IndividualData<TSingle extends IdentifiableResourceDescription> {
  public constructor(
    // Deriving classes may need to make HTTP requests of their own
    protected _http: HttpClient,
    private _idResolver: ResolveIndividualUrl,
    private _speakingName: string
  ) {}

  // Backing field for local cache, (obviously) not persisted between browser
  // sessions
  private _localCache: { [id: string]: TSingle } = {};

  /**
   * The individually cached resources.
   */
  protected readonly _individualCache = new IndividualDescriptionCache<TSingle>(
    this._http,
    this._idResolver
  );

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

    return this._individualCache.getDescription(id);
  }

  /**
   * @param id The ID of the item to retrieve from cache
   * @param onMissing What to do if the item does not exist: Issue a request or return `undefined`
   * @return A locally cached version of the given resource
   */
  getLocal(id: string, onMissing: "undefined"): TSingle;
  getLocal(id: string, onMissing: "request"): Promise<TSingle>;
  getLocal(
    id: string,
    onMissing: "request" | "undefined" = "undefined"
  ): TSingle | Promise<TSingle> {
    let toReturn = this._localCache[id];
    if (!toReturn && onMissing === "request") {
      return this.getSingle(id)
        .pipe(
          // Without taking only the first item from `getSingle`, the promise
          // will never be fulfilled
          first(),
          // Store value as a side effect
          tap((value) => this.setLocal(value))
        )
        .toPromise();
    } else if (onMissing === "request") {
      return Promise.resolve(toReturn);
    } else {
      return toReturn;
    }
  }

  /**
   * @param res The resource to cache locally
   */
  setLocal(res: TSingle) {
    console.log(
      `Cache "${this._speakingName}" - Item with id ${res.id} added: `,
      res
    );
    this._localCache[res.id] = res;
  }
}
