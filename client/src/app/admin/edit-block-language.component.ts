import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute, ParamMap } from '@angular/router'

import { ServerDataService } from 'app/shared/server-data.service';
import { switchMap, map, tap } from 'rxjs/operators';

@Component({
  templateUrl: 'templates/edit-block-language.html'
})
export class EditBlockLanguageComponent {
  constructor(
    private _serverData: ServerDataService,
    private _activatedRoute: ActivatedRoute
  ) {
  }

  readonly blockLanguage = this._activatedRoute.paramMap.pipe(
    tap((params: ParamMap) => console.log(params)),
    map((params: ParamMap) => params.get('blockLanguageId')),
    switchMap((id: string) => this._serverData.getBlockLanguage(id)),
  );

}