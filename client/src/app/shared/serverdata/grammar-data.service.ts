import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { GrammarDescription, GrammarListDescription } from '../syntaxtree';

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

/**
 * Cached access to lists of grammars.
 */
@Injectable()
export class ListGrammarDataService extends ListData<GrammarListDescription> {
  constructor(
    serverApi: ServerApiService,
    http: HttpClient
  ) {
    super(http, serverApi.getGrammarListUrl());
  }
}

@Injectable()
export class MutateGrammarService extends MutateData<GrammarDescription> {
  public constructor(
    // Deriving classes may need to make HTTP requests of their own
    http: HttpClient,
    snackBar: MatSnackBar,
    serverApi: ServerApiService,
  ) {
    super(http, snackBar, urlResolver(serverApi), "Grammar")
  }
}