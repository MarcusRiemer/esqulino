import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { Title } from '@angular/platform-browser'

import { switchMap, map, first } from 'rxjs/operators'

import { ToolbarService } from '../shared/toolbar.service'
import { CachedRequest, GrammarDataService } from '../shared/serverdata'
import { ServerApiService } from '../shared/serverdata/serverapi.service'
import { prettyPrintGrammar } from '../shared/syntaxtree/prettyprint'
import { GrammarDescription } from '../shared/syntaxtree'
import { BlockLanguageListDescription } from '../shared/block/block-language.description'

@Component({
  templateUrl: 'templates/edit-grammar.html'
})
export class EditGrammarComponent implements OnInit {

  @ViewChild("toolbarButtons", { static: true })
  toolbarButtons: TemplateRef<any>;

  // The grammar that is beeing edited
  grammar: GrammarDescription;

  // Block languages that are related to this grammar
  relatedBlockLanguages: CachedRequest<BlockLanguageListDescription[]>;

  // Indicates whether the state of the editor is synchronized
  // with the rendered grammar.
  typesSynced = true;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _http: HttpClient,
    private _serverApi: ServerApiService,
    private _grammarData: GrammarDataService,
    private _title: Title,
    private _toolbarService: ToolbarService
  ) {
  }

  ngOnInit() {
    // Grab the first grammar from the server and do not update it if
    // the server data changes.
    this._activatedRoute.paramMap.pipe(
      map((params: ParamMap) => params.get('grammarId')),
      switchMap((id: string) => this._grammarData.getSingle(id).pipe(first())),
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

    // Setup the toolbar buttons
    this._toolbarService.addItem(this.toolbarButtons);
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

  /**
   * User has decided to save.
   */
  onSave() {
    this._grammarData.updateSingle(this.grammar);
  }

  /**
   * User has decided to delete.
   */
  async onDelete() {
    await this._grammarData.deleteSingle(this.grammar.id);
    this._router.navigate([".."], { relativeTo: this._activatedRoute });
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
