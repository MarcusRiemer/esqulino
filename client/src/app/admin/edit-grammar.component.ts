import { Component, OnInit, ViewChild } from '@angular/core'
import { Router, ActivatedRoute, ParamMap } from '@angular/router'
import { HttpClient } from '@angular/common/http';

import { switchMap, map, tap, first } from 'rxjs/operators';

import { JsonEditorOptions, JsonEditorComponent } from 'ang-jsoneditor';

import { ServerDataService, CachedRequest } from '../shared/server-data.service';
import { prettyPrintGrammar } from '../shared/syntaxtree/prettyprint';
import { GrammarDescription } from '../shared/syntaxtree';
import { BlockLanguageListDescription } from '../shared/block/block-language.description';
import { ServerApiService } from '../shared/serverapi.service';

@Component({
  templateUrl: 'templates/edit-grammar.html'
})
export class EditGrammarComponent implements OnInit {

  @ViewChild('typesEditor') editor: JsonEditorComponent;

  readonly editorOptions = new JsonEditorOptions();

  // The grammar that is beeing edited
  grammar: GrammarDescription;

  // Block languages that are related to this grammar
  relatedBlockLanguages: CachedRequest<BlockLanguageListDescription[]>;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _http: HttpClient,
    private _serverApi: ServerApiService,
    private _serverData: ServerDataService,
  ) {
  }

  ngOnInit() {
    // Grab the first grammar from the server and do not update it if
    // the server data changes.
    this._activatedRoute.paramMap.pipe(
      map((params: ParamMap) => params.get('grammarId')),
      switchMap((id: string) => this._serverData.getGrammarDescription(id).pipe(first())),
    ).subscribe(g => this.grammar = g);

    // Always grab fresh related block languages
    this._activatedRoute.paramMap.pipe(
      map((params: ParamMap) => params.get('grammarId')),
    ).subscribe(id => {
      const relatedUrl = this._serverApi.individualGrammarRelatedBlockLanguagesUrl(id);
      const request = this._http.get<BlockLanguageListDescription[]>(relatedUrl);
      this.relatedBlockLanguages = new CachedRequest<BlockLanguageListDescription[]>(request);
    });

    // Options for the type editor
    this.editorOptions.sortObjectKeys = false;
    this.editorOptions.modes = ["tree", "text", "code"];
    this.editorOptions.mode = "code";
  }

  onTypeDataUpdate() {
    try {
      const newTypes = JSON.parse(this.editor.getText());
      this.grammar.types = newTypes;
    } catch (e) {
      alert("Konnte neue Typen nicht setzen");
    }
  }

  onSave() {
    this._serverData.updateGrammar(this.grammar);
  }

  /**
   * The compiled version of the grammar
   */
  get prettyPrintedGrammar() {
    return (prettyPrintGrammar(this.grammar));
  }
}
