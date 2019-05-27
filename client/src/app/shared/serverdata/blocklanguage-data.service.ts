import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BlockLanguageListDescription, BlockLanguageDescription } from '../block/block-language.description';

import { ServerApiService } from './serverapi.service';
import { DataService } from './data-service';
import { first } from 'rxjs/operators';

/**
 * Convenient and cached access to server side grammar descriptions.
 */
@Injectable()
export class BlockLanguageDataService extends DataService<BlockLanguageListDescription, BlockLanguageDescription> {

  public constructor(
    private _serverApi: ServerApiService,
    http: HttpClient
  ) {
    super(http, _serverApi.getGrammarListUrl());
  }

  protected resolveIndividualUrl(id: string): string {
    return (this._serverApi.individualBlockLanguageUrl(id));
  }

  /**
   * Deletes the block language with the given ID.
   */
  deleteBlockLanguage(id: string) {
    this._http.delete(this._serverApi.individualBlockLanguageUrl(id))
      .pipe(first())
      .subscribe(_ => {
        console.log(`Deleted BlockLanguage "${id}"`);
        this.listCache.refresh();
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
        this.listCache.refresh();
        this._individualCache.refreshDescription(desc.id);
      });
  }
}