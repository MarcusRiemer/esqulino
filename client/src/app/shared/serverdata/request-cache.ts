import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, tap, shareReplay, scan, map, filter, catchError } from 'rxjs/operators';

/**
 * Caches the initial result of the given Observable (which is meant to be an Angular
 * HTTP request) and provides an option to explicitly refresh the value by re-subscribing
 * to the inital Observable.
 */
export class CachedRequest<T> {
  // Every new value triggers another request. The exact value
  // is not of interest, so a single valued type seems appropriate.
  private _trigger = new BehaviorSubject<"trigger">("trigger");

  // Signals the number of requests that are currently in progress.
  // This counter must be initialized with 1, even though there is technically
  // no request in progress unless `value` has been accessed at least
  // once. Take a comfortable seat for a lengthy explanation:
  //
  // Subscribing to `value` has a side-effect: It increments the
  // `_inProgress`-counter. And Angular (for good reasons) *really*
  // dislikes side-effects from operations that should be considered
  // "reading"-operations. It therefore evaluates every template expression
  // twice (when in debug mode) which leads to the following observations
  // if both `inProgress` and `value` are used in the same template:
  //
  // 1) Subscription: No cached value, request count was 0 but is incremented
  // 2) Subscription: WAAAAAH, the value of `inProgress` has changed! ABORT!!11
  //
  // And then Angular aborts with a nice `ExpressionChangedAfterItHasBeenCheckedError`.
  // This is a race condition par excellence, in theory the request could also
  // be finished between checks #1 and #2 which would lead to the same error. But
  // in practice the server will not respond that fast. And I was to lazy to check
  // whether the Angular devs might have taken HTTP-requests into account and simply
  // don't allow any update to them when rendering in debug mode. If they were so
  // smart they have at least made this error condition impossible *for HTTP requests*.
  //
  // So we are between a rock and a hard place. From the top of my head, there seem to
  // be 2 possible workarounds that can work with a `_inProgress`-counter that is
  // initialized with 1.
  //
  // 1) Do all increment-operations in the in `refresh`-method.
  //    This works because `refresh` is never implicitly triggered. This leads to
  //    incorrect results for `inProgress` if the `value` is never actually
  //    triggered: An in progress request is assumed even if no request was fired.
  // 2) Introduce some member variable that introduces special behavior when
  //    before the first subscription is made: Report progress only if some
  //    initial subscription took place and do **not** increment the counter
  //    the very first time.
  //
  // For the moment, I went with option 1.
  private _inProgress = new BehaviorSubject<1 | -1>(1);

  // True if an error occured. This effectively stops all further requests from
  // this this cache unless explicitly cleared.
  private _error = new BehaviorSubject<any>(undefined);

  constructor(
    private _sourceObservable: Observable<T>
  ) { }

  /**
   * Retrieve the current value. This triggers a request if no current value
   * exists and there is no other request in progress.
   */
  readonly value: Observable<T> = this._trigger.pipe(
    // Ensure that no new request is started if a previous request caused an error
    filter(_ => !this._error.value),
    // Hand over to the wrapped observable
    switchMap(_ => this._sourceObservable),
    // Log that the request has been fulfilled
    tap(_ => this.changeRequestCount(-1)),
    // Treat errors as non existant values (for the moment)
    catchError(e => {
      console.exception(`Error in cached request`, e);
      this._error.next(true);
      return (of(undefined));
    }),
    // Ensure that the request is properly cached
    shareReplay(1)
  );

  /**
   * Reports whether there is currently a request in progress.
   */
  readonly inProgress = this._inProgress.pipe(
    scan((count, current) => count + current, 0),
    map(count => count > 0)
  );

  /**
   * Indicates whether there is an error
   */
  readonly hasError = this._error.pipe(
    map(err => !!err)
  );

  /**
   * Unconditionally triggers a new request.
   */
  refresh(newObs?: Observable<T>) {
    if (newObs) {
      this._sourceObservable = newObs;
    }
    this.changeRequestCount(1);
    this._trigger.next("trigger");
  }

  /**
   * Signals that a change to the counter has been made.
   */
  private changeRequestCount(change: 1 | -1) {
    this._inProgress.next(change);
  }
}

/**
 * Caches descriptions that may be requested from the server.
 */
export class IndividualDescriptionCache<T> {
  private cache: { [id: string]: CachedRequest<T> } = {};

  public constructor(
    private http: HttpClient,
    private idCallback: (id: string) => string,
  ) {
  }

  /**
   * Request an object with a specific ID.
   */
  public getDescription(id: string): Observable<T> {
    if (!this.cache[id]) {
      this.cache[id] = new CachedRequest<T>(this.http.get<T>(this.idCallback(id)))
    }

    return (this.cache[id].value);
  }

  /**
   * Updates the cached item with the given ID.
   */
  refreshDescription(id: string) {
    const toRefresh = this.cache[id];
    if (toRefresh) {
      toRefresh.refresh();
    }
  }
}
