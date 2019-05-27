import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { GrammarDescription, GrammarListDescription } from '../syntaxtree';
import { fieldCompare } from '../util';

import { ServerApiService } from './serverapi.service';
import { DataService } from './data-service';

import { map, first } from 'rxjs/operators';

/**
 * Convenient and cached access to server side grammar descriptions.
 */
@Injectable()
export class GrammarDataService extends DataService<GrammarListDescription, GrammarDescription> {

  public constructor(
    private _serverApi: ServerApiService,
    http: HttpClient
  ) {
    super(http, _serverApi.getGrammarListUrl());
  }

  protected resolveIndividualUrl(id: string): string {
    return (this._serverApi.individualGrammarUrl(id));
  }

  /**
   * Grammars in stable sort order.
   *
   * @return All grammars that are known on the server and available for the current user.
   */
  readonly list = this.listCache.value.pipe(
    map(list => list.sort(fieldCompare<GrammarListDescription>("name")))
  );

  /**
   * Deletes the grammar with the given ID.
   */
  deleteGrammar(id: string) {
    this._http.delete(this._serverApi.individualGrammarUrl(id))
      .pipe(first())
      .subscribe(_ => {
        console.log(`Deleted Grammar "${id}"`);
        this.listCache.refresh();
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
        this.listCache.refresh();
        this._individualCache.refreshDescription(desc.id);
      });
  }
}