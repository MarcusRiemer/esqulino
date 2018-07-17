import { Injectable, Type } from '@angular/core'
import { HttpClient } from '@angular/common/http';

import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { shareReplay, first, map, switchMap, tap, scan, delay } from 'rxjs/operators';

import { ServerApiService } from '../shared/serverapi.service';

import {
  BlockLanguageDescription, BlockLanguageListDescription
} from '../shared/block/block-language.description';
import {
  BlockLanguageGeneratorDescription, BlockLanguageGeneratorListDescription
} from '../shared/block/generator.description'
import {
  GrammarDescription, GrammarListDescription
} from '../shared/syntaxtree/grammar.description';
import { transition } from '@angular/animations';

/**
 * Caches the initial result of the given Observable (which is meant to be an Angular
 * HTTP request) and provides an option to explicitly refresh the value by re-subscribing
 * to the inital Observable.
 */
class CachedRequest<T> {
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

  constructor(
    private _httpRequest: Observable<T>
  ) { }

  /**
   * Retrieve the current value. This triggers a request if no current value
   * exists and there is no other request in progress.
   */
  readonly value: Observable<T> = this._trigger.pipe(
    // tap(_ => this.changeRequestCount(1)),
    switchMap(_ => this._httpRequest),
    tap(_ => this.changeRequestCount(-1)),
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
   * Unconditionally triggers a new request.
   */
  refresh() {
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
class IndividualDescriptionCache<T> {
  private cache: { [id: string]: Observable<T> } = {};

  public constructor(
    private http: HttpClient,
    private idCallback: (id: string) => string,
  ) {
  }

  /**
   * Request an object with a specific ID of type T.
   */
  public getDescription(id: string): Observable<T> {
    if (!this.cache[id]) {
      this.cache[id] = this.http.get<T>(this.idCallback(id))
        .pipe(shareReplay(1));
    }

    return (this.cache[id]);
  }
}

/**
 * Convenient and cached access to server side descriptions.
 */
@Injectable()
export class ServerDataService {
  public constructor(
    private _serverApi: ServerApiService,
    private http: HttpClient
  ) {
  }

  // Caching individual grammars
  private readonly individualGrammars = new IndividualDescriptionCache<GrammarDescription>(
    this.http,
    id => this._serverApi.getGrammarUrl(id)
  );

  // Caching individual block languages
  private readonly individualBlockLanguages = new IndividualDescriptionCache<BlockLanguageDescription>(
    this.http,
    id => this._serverApi.individualBlockLanguageUrl(id)
  );

  // Backing cache for listing of all block languages
  readonly listBlockLanguages = new CachedRequest<BlockLanguageListDescription[]>(
    this.http.get<BlockLanguageListDescription[]>(this._serverApi.getBlockLanguageListUrl())
  );

  /**
   * @return All block language generators that are known on the server.
   */
  readonly listBlockLanguageGenerators = new CachedRequest<BlockLanguageGeneratorListDescription[]>(
    this.http.get<BlockLanguageGeneratorListDescription[]>(this._serverApi.getBlockLanguageGeneratorListUrl())
  );

  /**
   * @return All grammars that are known on the server
   */
  readonly listGrammars = new CachedRequest<GrammarListDescription[]>(
    this.http.get<GrammarListDescription[]>(this._serverApi.getGrammarListUrl())
  );

  deleteBlockLanguage(id: string) {
    this.http.delete(this._serverApi.individualBlockLanguageUrl(id))
      .pipe(first())
      .subscribe(r => {
        console.log(`Deleted BlockLanguage "${id}"`);
        this.listBlockLanguages.refresh();
      });
  }

  /**
   * @return The details of the specified grammar.
   */
  getGrammarDescription(id: string): Observable<GrammarDescription> {
    return (this.individualGrammars.getDescription(id));
  }

  /**
   * @return The details of the specified grammar.
   */
  getBlockLanguage(id: string): Observable<BlockLanguageDescription> {
    return (this.individualBlockLanguages.getDescription(id));
  }
}
