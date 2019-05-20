import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http';

import { Observable, BehaviorSubject } from 'rxjs';
import { shareReplay, first, map, switchMap, tap, scan } from 'rxjs/operators';

import {
  BlockLanguageDescription, BlockLanguageListResponseDescription
} from '../../shared/block/block-language.description';
import {
  BlockLanguageGeneratorListDescription
} from '../../shared/block/generator/generator.description'
import {
  GrammarDescription, GrammarListDescription
} from '../../shared/syntaxtree/grammar.description';

import { fieldCompare } from '../util';

import { ServerApiService } from './serverapi.service';
import { NewsFrontpageDescription, NewsUpdateDescription } from '../news.description';
import { NewsDescription } from '../news.description';

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

/**
 * Convenient and cached access to server side descriptions.
 */
@Injectable()
export class ServerDataService {
  public constructor(
    private _serverApi: ServerApiService,
    private _http: HttpClient
  ) {
  }

  // Caching individual grammars
  private readonly individualGrammars = new IndividualDescriptionCache<GrammarDescription>(
    this._http,
    id => this._serverApi.individualGrammarUrl(id)
  );

  // Caching individual block languages
  private readonly individualBlockLanguages = new IndividualDescriptionCache<BlockLanguageDescription>(
    this._http,
    id => this._serverApi.individualBlockLanguageUrl(id)
  );

  // Backing cache for listing of all block languages
  readonly listBlockLanguages = new CachedRequest<BlockLanguageListResponseDescription[]>(
    this._http.get<BlockLanguageListResponseDescription[]>(this._serverApi.getBlockLanguageListUrl())
      .pipe(
        map(list => list.sort(fieldCompare<BlockLanguageListResponseDescription>("name")))
      )
  );

  /**
   * @return All block language generators that are known on the server.
   */
  readonly listBlockLanguageGenerators = new CachedRequest<BlockLanguageGeneratorListDescription[]>(
    this._http.get<BlockLanguageGeneratorListDescription[]>(this._serverApi.getBlockLanguageGeneratorListUrl())
  );

  /**
   * @return All grammars that are known on the server
   */
  readonly listGrammars = new CachedRequest<GrammarListDescription[]>(
    this._http.get<GrammarListDescription[]>(this._serverApi.getGrammarListUrl())
      .pipe(
        map(list => list.sort(fieldCompare<GrammarListDescription>("name")))
      )
  );

  readonly getUserNewsList = new CachedRequest<NewsFrontpageDescription[]>(
    this._http.get<NewsFrontpageDescription[]>(this._serverApi.getUserNewsListUrl())
  );

  readonly getAdminNewsList = new CachedRequest<NewsDescription[]>(
    this._http.get<NewsDescription[]>(this._serverApi.getAdminNewsListUrl())
  );

  readonly getAdminNewsSingle = new IndividualDescriptionCache<NewsDescription>(
    this._http,
    id => this._serverApi.getAdminNewsSingle(id)
  );

  readonly getUserNewsDetails = new IndividualDescriptionCache<NewsFrontpageDescription>(
    this._http,
    id => this._serverApi.getNewsSingle(id)
  );

  /**
   * creating a new news
   */
  createNews(desc: NewsUpdateDescription): Observable<NewsDescription> {
    // The given description may have to many fields, we need to strip
    // every unneeded field.
    desc = {
      publishedFrom: desc.publishedFrom || null,
      text: desc.text,
      title: desc.title
    };

    const url = this._serverApi.getCreateNewsUrl();
    const toReturn = this._http.post<NewsDescription>(url, desc).pipe(
      tap((desc) => {
        console.log(`Created news "${desc.id}"`);
        this.getAdminNewsList.refresh();
      })
    );

    return (toReturn);
  }

  /**
   * Updates the given news
   */
  updateNews(id: string, desc: NewsUpdateDescription): Observable<NewsDescription> {
    // The given description may have to many fields, we need to strip
    // every unneeded field.
    desc = {
      publishedFrom: desc.publishedFrom || null,
      text: desc.text,
      title: desc.title
    };

    const url = this._serverApi.getNewsUpdateUrl(id);
    const toReturn = this._http.put<NewsDescription>(url, desc).pipe(
      // Refresh our local caches
      tap(_ => {
        console.log(`Updated news "${id}"`);
        this.getAdminNewsList.refresh();
        this.getAdminNewsSingle.refreshDescription(id);
      })
    );

    return (toReturn);
  }

  /**
 * Deletes the news with the given ID.
 */
  deleteNews(id: string): Observable<Object> {
    const toReturn = this._http.delete(this._serverApi.getNewsSingle(id))
      .pipe(
        tap(_ => {
          console.log(`Deleted news "${id}"`);
          this.getAdminNewsList.refresh();
        }),
        first()
      )
    return (toReturn);
  }

  /**
   * @return The details of the specified grammar.
   */
  getBlockLanguage(id: string): Observable<BlockLanguageDescription> {
    return (this.individualBlockLanguages.getDescription(id));
  }

  /**
   * Deletes the block language with the given ID.
   */
  deleteBlockLanguage(id: string) {
    this._http.delete(this._serverApi.individualBlockLanguageUrl(id))
      .pipe(first())
      .subscribe(_ => {
        console.log(`Deleted BlockLanguage "${id}"`);
        this.listBlockLanguages.refresh();
      });
  }

  /**
   * Updates the given block language
   */
  updateBlockLanguage(desc: BlockLanguageDescription) {
    const url = this._serverApi.individualBlockLanguageUrl(desc.id);
    this._http.put(url, desc)
      .subscribe(_ => {
        console.log(`Updated BlockLanguage "${desc.id}"`);
        this.listBlockLanguages.refresh();
        this.individualBlockLanguages.refreshDescription(desc.id);
      });
  }

  /**
   * Updates the given grammar
   */
  updateGrammar(desc: GrammarDescription) {
    const url = this._serverApi.individualGrammarUrl(desc.id);
    this._http.put(url, desc)
      .subscribe(_ => {
        console.log(`Updated Grammar "${desc.id}"`);
        this.listGrammars.refresh();
        this.individualGrammars.refreshDescription(desc.id);
      });
  }

  /**
   * Deletes the grammar with the given ID.
   */
  deleteGrammar(id: string) {
    this._http.delete(this._serverApi.individualGrammarUrl(id))
      .pipe(first())
      .subscribe(_ => {
        console.log(`Deleted Grammar "${id}"`);
        this.listGrammars.refresh();
      });
  }

  /**
   * @return The details of the specified grammar.
   *
   * @param id The id of the searched grammar
   * @param refresh True, if the cache must be updated
   */
  getGrammarDescription(id: string, refresh = false): Observable<GrammarDescription> {
    if (refresh) {
      this.individualGrammars.refreshDescription(id);
    }
    return (this.individualGrammars.getDescription(id));
  }
}
