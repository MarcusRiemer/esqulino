import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute, ParamMap } from '@angular/router'

import { ServerDataService } from 'app/shared/server-data.service';
import { switchMap, map, tap } from 'rxjs/operators';

@Component({
  templateUrl: 'templates/edit-grammar.html'
})
export class EditGrammarComponent {
  constructor(
    private _serverData: ServerDataService,
    private _activatedRoute: ActivatedRoute
  ) {
  }

  readonly grammar = this._activatedRoute.paramMap.pipe(
    map((params: ParamMap) => params.get('grammarId')),
    switchMap((id: string) => this._serverData.getGrammar(id)),
  );

}