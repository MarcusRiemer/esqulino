import { Injectable, Type } from '@angular/core'
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { shareReplay, first } from 'rxjs/operators';

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

class CachedRequest<T> {

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
  private readonly grammars = new IndividualDescriptionCache<GrammarDescription>(
    this.http,
    id => this._serverApi.getGrammarUrl(id)
  );

  // Caching individual block languages
  private readonly blockLanguages = new IndividualDescriptionCache<BlockLanguageDescription>(
    this.http,
    id => this._serverApi.individualBlockLanguageUrl(id)
  );

  // The HTTP-request that is backing `availableBlockLanguages`
  private readonly requestBlockLanguages =
    this.http.get<BlockLanguageListDescription[]>(this._serverApi.getBlockLanguageListUrl())

  /**
   * @return All block languages that are known on the server
   */
  readonly availableBlockLanguages = this.requestBlockLanguages.pipe(shareReplay(1));

  /**
   * @return All block language generators that are known on the server.
   */
  readonly availableBlockLanguageGenerators =
    this.http.get<BlockLanguageGeneratorListDescription[]>(this._serverApi.getBlockLanguageGeneratorListUrl())
      .pipe(shareReplay(1));

  /**
   * @return All grammars that are known on the server
   */
  readonly availableGrammars =
    this.http.get<GrammarListDescription[]>(this._serverApi.getGrammarListUrl())
      .pipe(shareReplay(1));

  /**
   *
   */
  refreshBlockLanguages() {
    let sub = this.requestBlockLanguages.subscribe(r => {
      console.log("Refreshed Block languages");
      sub.unsubscribe();
    });
  }

  deleteBlockLanguage(id: string) {
    let sub = this.http.delete(this._serverApi.individualBlockLanguageUrl(id))
      .subscribe(r => {
        console.log(`Deleted BlockLanguage "${id}"`);
        sub.unsubscribe();
      });
  }

  /**
   * @return The details of the specified grammar.
   */
  getGrammarDescription(id: string): Observable<GrammarDescription> {
    return (this.grammars.getDescription(id));
  }

  /**
   * @return The details of the specified grammar.
   */
  getBlockLanguage(id: string): Observable<BlockLanguageDescription> {
    return (this.blockLanguages.getDescription(id));
  }
}
