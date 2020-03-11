import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Subscription } from 'rxjs';

import { BlockLanguageListDescription, BlockLanguageDescription } from '../block/block-language.description';

import { ServerApiService } from './serverapi.service';
import { ListData } from './list-data';
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

@Injectable()
export class MutateBlockLanguageService extends MutateData<BlockLanguageDescription> {
  public constructor(
    http: HttpClient,
    snackBar: MatSnackBar,
    serverApi: ServerApiService,
  ) {
    super(http, snackBar, urlResolver(serverApi), "BlockLanguage")
  }
}

@Injectable()
export class ListBlockLanguageDataService extends ListData<BlockLanguageListDescription> implements OnDestroy {
  private _subscriptions: Subscription[] = [];

  public constructor(
    serverApi: ServerApiService,
    http: HttpClient,
    mutateService: MutateBlockLanguageService,
  ) {
    super(http, serverApi.getBlockLanguageListUrl());

    const s = mutateService.listInvalidated.subscribe(() => this.listCache.refresh());

    this._subscriptions = [s];
  }

  ngOnDestroy() {
    this._subscriptions.forEach(s => s.unsubscribe());
    this._subscriptions = [];
  }
}