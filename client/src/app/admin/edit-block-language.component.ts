import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute, ParamMap } from '@angular/router'

import { switchMap, map, tap } from 'rxjs/operators';

import { ServerDataService } from '../shared/server-data.service';
import { prettyPrintBlockLanguage } from '../shared/block/prettyprint';

@Component({
  templateUrl: 'templates/edit-block-language.html'
})
export class EditBlockLanguageComponent {
  constructor(
    private _serverData: ServerDataService,
    private _activatedRoute: ActivatedRoute
  ) {
  }

  /**
   * Mapping the URL parameter to a actual block language
   */
  readonly blockLanguage = this._activatedRoute.paramMap.pipe(
    map((params: ParamMap) => params.get('blockLanguageId')),
    switchMap((id: string) => this._serverData.getBlockLanguage(id)),
  );

  /**
   * The compiled version of the block language
   */
  readonly prettyPrintedBlockLanguage = this.blockLanguage.pipe(
    map(g => prettyPrintBlockLanguage(g))
  );

}