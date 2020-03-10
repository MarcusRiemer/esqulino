import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BlockLanguageListDescription, BlockLanguageDescription } from '../block/block-language.description';

import { ServerApiService } from './serverapi.service';
import { ListData } from './data-service';
import { IndividualData } from './individual-data';
import { MutateData } from './mutate-data';

const urlResolver = (serverApi: ServerApiService) => {
  return ((id: string) => serverApi.individualBlockLanguageUrl(id))
}


@Injectable()
export class IndividualBlockLanguageDataService extends IndividualData<BlockLanguageDescription> {
  constructor(
    serverApi: ServerApiService,
    http: HttpClient,
  ) {
    super(http, urlResolver(serverApi), "BlockLanguage")
  }
}

/**
 * Convenient and cached access to server side grammar descriptions.
 */
@Injectable()
export class ListBlockLanguageDataService extends ListData<BlockLanguageListDescription> {

  public constructor(
    private _serverApi: ServerApiService,
    http: HttpClient
  ) {
    super(http, _serverApi.getBlockLanguageListUrl());
  }
}

@Injectable()
export class MutateBlockLanguageService extends MutateData<BlockLanguageDescription> {
  public constructor(
    // Deriving classes may need to make HTTP requests of their own
    http: HttpClient,
    snackBar: MatSnackBar,
    serverApi: ServerApiService,
  ) {
    super(http, snackBar, urlResolver(serverApi), "BlockLanguage")
  }
}