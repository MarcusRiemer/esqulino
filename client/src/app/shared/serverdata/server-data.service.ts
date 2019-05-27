import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';

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

import { NewsFrontpageDescription, NewsUpdateDescription } from '../news.description';
import { NewsDescription } from '../news.description';

import { ServerApiService } from './serverapi.service';
import { IndividualDescriptionCache, CachedRequest } from './request-cache';

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
