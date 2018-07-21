import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute, ParamMap } from '@angular/router'

import { switchMap, map, tap } from 'rxjs/operators';

import { ServerDataService } from '../shared/server-data.service';
import { prettyPrintGrammar } from '../shared/syntaxtree/prettyprint';
import { JsonEditorOptions } from 'ang-jsoneditor';


@Component({
  templateUrl: 'templates/edit-grammar.html'
})
export class EditGrammarComponent implements OnInit {
  constructor(
    private _serverData: ServerDataService,
    private _activatedRoute: ActivatedRoute
  ) {
  }

  readonly editorOptions = new JsonEditorOptions();

  ngOnInit() {

  }

  /**
   * Mapping the URL parameter to an actual grammar
   */
  readonly grammar = this._activatedRoute.paramMap.pipe(
    map((params: ParamMap) => params.get('grammarId')),
    switchMap((id: string) => this._serverData.getGrammarDescription(id)),
  );

  /**
   * The compiled version of the grammar
   */
  readonly prettyPrintedGrammar = this.grammar.pipe(
    map(g => prettyPrintGrammar(g))
  );
}
