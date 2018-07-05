import { Injectable, Type } from '@angular/core'
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { ServerApiService } from '../shared/serverapi.service';

import {
  BlockLanguageDescription, BlockLanguageListDescription
} from '../shared/block/block-language.description';
import {
  GrammarDescription, GrammarListDescription
} from '../shared/syntaxtree/grammar.description';

/**
 * Convenient and cached access to server side descriptions.
 */
@Injectable()
export class ServerDataService {

  private grammars: { [key: string]: Observable<GrammarDescription> } = {};

  private blockLanguages: { [key: string]: Observable<BlockLanguageDescription> } = {};

  public constructor(
    private _serverApi: ServerApiService,
    private http: HttpClient
  ) {

  }

  /**
   * @return All block languages that are known on the server
   */
  readonly availableBlockLanguages =
    this.http.get<BlockLanguageListDescription[]>(this._serverApi.getBlockLanguageListUrl())
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
    if (!this.grammars[id]) {
      this.grammars[id] = this.http.get<GrammarDescription>(this._serverApi.getGrammarUrl(id))
        .pipe(shareReplay(1));
    }

    return (this.grammars[id]);
  }

  /**
   * @return The details of the specified grammar.
   */
  getBlockLanguage(id: string): Observable<BlockLanguageDescription> {
    if (!this.blockLanguages[id]) {
      this.blockLanguages[id] = this.http.get<BlockLanguageDescription>(this._serverApi.getBlockLanguageUrl(id))
        .pipe(shareReplay(1));
    }

    return (this.blockLanguages[id]);
  }
}
