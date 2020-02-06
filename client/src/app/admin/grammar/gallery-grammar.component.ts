import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Observable, from } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';

import { GrammarDataService } from '../../shared/serverdata';
import { GrammarDescription } from '../../shared';

@Component({
  templateUrl: 'templates/gallery-grammar.html'
})
export class GalleryGrammarComponent implements OnInit {

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _grammarData: GrammarDataService,
  ) { }

  ngOnInit() {

  }

  readonly grammar$: Observable<GrammarDescription> = this._activatedRoute.paramMap.pipe(
    map((params: ParamMap) => params.get('grammarId')),
    switchMap(id => from(this._grammarData.getLocal(id, "request"))),
  )
}