import { Injectable, OnDestroy, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import {Query} from "apollo-angular";
import gql from 'graphql-tag';

import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { GrammarDescription, GrammarListDescription,GrammarListGraphQlResponse } from '../syntaxtree';
import { fieldCompare } from '../util'

import { ServerApiService } from './serverapi.service';
import { ListData } from './list-data';
import { IndividualData } from './individual-data';
import { MutateData } from './mutate-data';

const urlResolver = (serverApi: ServerApiService) => {
  return ((id: string) => serverApi.individualGrammarUrl(id))
}


/**
 * Cached access to individual grammars
 */
@Injectable()
export class IndividualGrammarDataService extends IndividualData<GrammarDescription> {
  constructor(
    serverApi: ServerApiService,
    http: HttpClient,
  ) {
    super(http, urlResolver(serverApi), "Grammar")
  }
}

@Injectable()
export class MutateGrammarService extends MutateData<GrammarDescription> {
  public constructor(
    http: HttpClient,
    snackBar: MatSnackBar,
    serverApi: ServerApiService,
  ) {
    super(http, snackBar, urlResolver(serverApi), "Grammar")
  }
}

/**
 * Cached access to lists of grammars.
 */
@Injectable()
export class ListGrammarDataService extends ListData<GrammarListDescription> implements OnDestroy {
  private _subscriptions: Subscription[] = [];

  constructor(
    serverApi: ServerApiService,
    http: HttpClient,
    mutateService: MutateGrammarService,
  ) {
    super(http, serverApi.getGrammarListUrl());

    const s = mutateService.listInvalidated.subscribe(() => this.listCache.refresh());
    this._subscriptions = [s];
  }

  ngOnDestroy() {
    this._subscriptions.forEach(s => s.unsubscribe());
    this._subscriptions = [];
  }

  /**
   * Grammars in stable sort order.
   *
   * @return All grammars that are known on the server and available for the current user.
   */
  readonly list = this.listCache.value.pipe(
    map(list => list.sort(fieldCompare<GrammarListDescription>("name")))
  );
}

/**
 * Graphql Query for lists of grammars.
 */
@Injectable({
  providedIn: 'root'
})
export class GrammarListQL extends Query<GrammarListGraphQlResponse> {
  document = gql`
           {
            grammars {
                id
                name
                slug
                programmingLanguageId
            }
          }
        `;
}

/**
 * lists of grammars.
 */
@Injectable()
export class ListGrammarDataServiceGQL  extends Query<Response>  {

}