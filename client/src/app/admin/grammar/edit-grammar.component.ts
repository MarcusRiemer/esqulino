import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Title } from "@angular/platform-browser";

import { from } from "rxjs";
import { switchMap, map } from "rxjs/operators";

import { ToolbarService } from "../../shared/toolbar.service";
import {
  CachedRequest,
  IndividualGrammarDataService,
  MutateGrammarService,
} from "../../shared/serverdata";
import { ServerApiService } from "../../shared/serverdata/serverapi.service";
import { prettyPrintGrammar } from "../../shared/syntaxtree/prettyprint";
import { GrammarDescription, QualifiedTypeName } from "../../shared/syntaxtree";
import { BlockLanguageListDescription } from "../../shared/block/block-language.description";
import {
  getTypeList,
  allPresentTypes,
} from "../../shared/syntaxtree/grammar-type-util";

@Component({
  templateUrl: "templates/edit-grammar.html",
})
export class EditGrammarComponent implements OnInit {
  @ViewChild("toolbarButtons", { static: true })
  toolbarButtons: TemplateRef<any>;

  // The grammar that is beeing edited
  grammar: GrammarDescription;

  // Block languages that are related to this grammar
  relatedBlockLanguages: CachedRequest<BlockLanguageListDescription[]>;

  // All types that are available as root. These may not be regenerated
  // on the fly because [ngValue] uses the identity of the objects to compare them.
  availableTypes: QualifiedTypeName[] = [];

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _http: HttpClient,
    private _serverApi: ServerApiService,
    private _individualGrammarData: IndividualGrammarDataService,
    private _mutateGrammarData: MutateGrammarService,
    private _title: Title,
    private _toolbarService: ToolbarService
  ) {}

  ngOnInit() {
    // Grab the first grammar from the server or the local cache. The grammar must not
    // be updated if re-requested from the server by someone else.
    this._activatedRoute.paramMap
      .pipe(
        map((params: ParamMap) => params.get("grammarId")),
        switchMap((id: string) =>
          from(this._individualGrammarData.getLocal(id, "request"))
        )
      )
      .subscribe((g) => {
        this.grammar = g;
        this.availableTypes = getTypeList(allPresentTypes(this.grammar));
        this.grammarRoot = g.root;
        this._title.setTitle(`Grammar "${g.name}" - Admin - BlattWerkzeug`);

        // We want a local copy of the resource that is being edited available "globally"
        this._individualGrammarData.setLocal(g);
      });

    // Always grab fresh related block languages
    this._activatedRoute.paramMap
      .pipe(map((params: ParamMap) => params.get("grammarId")))
      .subscribe((id) => {
        const relatedUrl = this._serverApi.individualGrammarRelatedBlockLanguagesUrl(
          id
        );
        const request = this._http.get<BlockLanguageListDescription[]>(
          relatedUrl
        );
        this.relatedBlockLanguages = new CachedRequest<
          BlockLanguageListDescription[]
        >(request);
      });

    // Setup the toolbar buttons
    this._toolbarService.addItem(this.toolbarButtons);
  }

  /**
   * User has decided to save.
   */
  onSave() {
    this._mutateGrammarData.updateSingle(this.grammar);
  }

  get grammarRoot() {
    return this.grammar.root;
  }

  /**
   * Ensures that the instance of the qualified typename matches an instance in availableTypes.
   * This allows ngModel to pre-select the correct value.
   */
  set grammarRoot(t: QualifiedTypeName) {
    if (!!t) {
      this.grammar.root = this.availableTypes.find(
        (a) => a.languageName === t.languageName && a.typeName === t.typeName
      );
    } else {
      this.grammar.root = undefined;
    }
  }

  get grammarTypes() {
    return this.grammar.types;
  }

  /**
   * Updates the types that are available when set.
   */
  set grammarTypes(types) {
    this.grammar.types = types;
    this.availableTypes = getTypeList(allPresentTypes(this.grammar));
    this.grammarRoot = this.grammar.root;
  }

  /**
   * User has decided to delete.
   */
  async onDelete() {
    await this._mutateGrammarData.deleteSingle(this.grammar.id);
    this._router.navigate([".."], { relativeTo: this._activatedRoute });
  }

  async onRegenerateForeignTypes() {
    const updated = await this._mutateGrammarData.regenerateForeignTypes(
      this.grammar.id
    );

    this._individualGrammarData.setLocal(updated);
    this.grammar = updated;
  }

  /**
   * The compiled version of the grammar
   */
  get prettyPrintedGrammar() {
    try {
      return prettyPrintGrammar(this.grammar.name, this.grammar);
    } catch (e) {
      return e.message;
    }
  }
}
