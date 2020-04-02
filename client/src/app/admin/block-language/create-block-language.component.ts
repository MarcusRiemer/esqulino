import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

import { first, tap } from "rxjs/operators";

import { BlockLanguageDescription } from "../../shared/block/block-language.description";
import { DEFAULT_GENERATOR } from "../../shared/block/generator/generator.description";
import { generateBlockLanguage } from "../../shared/block/generator/generator";

import {
  ServerApiService,
  ListBlockLanguageDataService,
  IndividualGrammarDataService,
  ListGrammarDataService,
} from "../../shared/serverdata";

/**
 * A comprehensive way to create new block languages
 */
@Component({
  templateUrl: "templates/create-block-language.html",
  selector: "create-block-language",
})
export class CreateBlockLanguageComponent {
  // Synced with form
  blockLanguage: BlockLanguageDescription = {
    id: undefined,
    name: "",
    slug: "",
    blockLanguageGeneratorId: "",
    defaultProgrammingLanguageId: "",
    grammarId: "",
    editorBlocks: [],
    editorComponents: [],
    sidebars: [],
  };

  // Enables usage of slugs
  useSlug = false;

  constructor(
    private _serverData: ListBlockLanguageDataService,
    private _grammarData: IndividualGrammarDataService,
    private _grammarList: ListGrammarDataService,
    private _serverApi: ServerApiService,
    private _http: HttpClient,
    private _router: Router
  ) {}

  readonly availableGrammars = this._grammarList.list;

  /**
   * Attempts to create the specified block language
   */
  async submitForm() {
    // We need to give the new language a default programming language
    // and only the grammar knows which language that may be.
    const g = await this._grammarData
      .getSingle(this.blockLanguage.grammarId)
      .pipe(first())
      .toPromise();

    // Generate some default blocks
    const toCreate = generateBlockLanguage(
      this.blockLanguage,
      DEFAULT_GENERATOR,
      g
    );

    // Default the default programming language to use the same value as
    // the grammar.
    toCreate.defaultProgrammingLanguageId = g.programmingLanguageId;

    // Possibly forcefully remove a slug (instead of sending an empty string)
    if (!this.useSlug) {
      delete toCreate.slug;
    }

    const req = this._http
      .post<{ id: string }>(this._serverApi.createBlockLanguageUrl(), toCreate)
      .pipe(first())
      .toPromise();

    const res = await req;

    this._serverData.listCache.refresh();
    this._router.navigateByUrl(`/admin/block-language/${res.id}`);

    return res;
  }
}
