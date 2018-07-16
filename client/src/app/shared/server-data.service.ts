import { Injectable, Type } from '@angular/core'
import { HttpClient } from '@angular/common/http';

import { Observable, BehaviorSubject } from 'rxjs';
import { shareReplay, first, map } from 'rxjs/operators';

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

/**
 * Caches the initial result of the given Observable (which is meant to be an Angular
 * HTTP request) and provides an option to explicitly refresh the value.
 */
class CachedRequest<T> {
  private _cacheSubject = new BehaviorSubject<T>(undefined);
  private _inProgress = new BehaviorSubject<number>(0);

  constructor(
    private _httpRequest: Observable<T>
  ) { }

  /**
   * Retrieve the current value. This triggers a request if no current value
   * exists and there is no other request in progress.
   */
  get value(): Observable<T> {
    if (this._cacheSubject.value === undefined && this._inProgress.value === 0) {
      this.refresh();
    }
    return (this._cacheSubject);
  }

  /**
   * Reports whether there is currently a request in progress.
   */
  readonly inProgress = this._inProgress.pipe(
    map(count => count > 0)
  );

  /**
   * Unconditionally triggers a new request.
   */
  refresh() {
    this._inProgress.next(this._inProgress.value + 1);
    let sub = this._httpRequest.subscribe(result => {
      sub.unsubscribe();
      this._cacheSubject.next(result);
      this._inProgress.next(this._inProgress.value - 1);
    }, error => {
      this._inProgress.next(this._inProgress.value - 1);
    });
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
    let sub = this.http.delete(this._serverApi.individualBlockLanguageUrl(id))
      .subscribe(r => {
        console.log(`Deleted BlockLanguage "${id}"`);
        this.listBlockLanguages.refresh();
        sub.unsubscribe();
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
