import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, ParamMap } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { Title } from '@angular/platform-browser'

import { switchMap, map, first } from 'rxjs/operators'
import { ServerDataService, CachedRequest } from '../shared/server-data.service'
import { prettyPrintGrammar } from '../shared/syntaxtree/prettyprint'
import { GrammarDescription } from '../shared/syntaxtree'
import { BlockLanguageListDescription } from '../shared/block/block-language.description'
import { ServerApiService } from '../shared/serverapi.service'

@Component({
  templateUrl: 'templates/edit-grammar.html'
})
export class EditGrammarComponent implements OnInit {

  // The grammar that is beeing edited
  grammar: GrammarDescription;

  // Block languages that are related to this grammar
  relatedBlockLanguages: CachedRequest<BlockLanguageListDescription[]>;

  // Indicates whether the state of the editor is synchronized
  // with the rendered grammar.
  typesSynced = true;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _http: HttpClient,
    private _serverApi: ServerApiService,
    private _serverData: ServerDataService,
    private _title: Title,
  ) {
  }

  ngOnInit() {
    // Grab the first grammar from the server and do not update it if
    // the server data changes.
    this._activatedRoute.paramMap.pipe(
      map((params: ParamMap) => params.get('grammarId')),
      switchMap((id: string) => this._serverData.getGrammarDescription(id).pipe(first())),
    ).subscribe(g => {
      this.grammar = g;
      this._title.setTitle(`Grammar "${g.name}" - Admin - BlattWerkzeug`)
    });

    // Always grab fresh related block languages
    this._activatedRoute.paramMap.pipe(
      map((params: ParamMap) => params.get('grammarId')),
    ).subscribe(id => {
      const relatedUrl = this._serverApi.individualGrammarRelatedBlockLanguagesUrl(id);
      const request = this._http.get<BlockLanguageListDescription[]>(relatedUrl);
      this.relatedBlockLanguages = new CachedRequest<BlockLanguageListDescription[]>(request);
    });
  }

  onTypeDataUpdate(text: string) {
    try {
      const newTypes = JSON.parse(text);
      this.grammar.types = newTypes;
      this.typesSynced = true;
    } catch (e) {
      this.typesSynced = false;
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

  get availableTypes() {
    return (Object.keys(this.grammar.types))
  }
}
