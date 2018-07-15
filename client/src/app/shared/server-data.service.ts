import { Injectable, Type } from '@angular/core'
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

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
class DescriptionCache<T> {
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

  // Caching grammars
  private readonly grammars = new DescriptionCache<GrammarDescription>(
    this.http,
    id => this._serverApi.getGrammarUrl(id)
  );

  // Caching block languages
  private readonly blockLanguages = new DescriptionCache<BlockLanguageDescription>(
    this.http,
    id => this._serverApi.getBlockLanguageUrl(id)
  );

  /**
   * @return All programming languages that are known on the server
   */
  readonly availableProgrammingLanguages = of(["css", "sql", "regex", "dxml-eruby"]);

  /**
   * @return All block languages that are known on the server
   */
  readonly availableBlockLanguages =
    this.http.get<BlockLanguageListDescription[]>(this._serverApi.getBlockLanguageListUrl())
      .pipe(shareReplay(1));

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
