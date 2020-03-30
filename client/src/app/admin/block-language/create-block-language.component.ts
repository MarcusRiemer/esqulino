import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

import { first } from "rxjs/operators";

import { BlockLanguageDescription } from "../../shared/block/block-language.description";
import { DEFAULT_GENERATOR } from "../../shared/block/generator/generator.description";
import { generateBlockLanguage } from "../../shared/block/generator/generator";

import {
  ServerApiService,
  BlockLanguageDataService,
  GrammarDataService,
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
    private _serverData: BlockLanguageDataService,
    private _grammarData: GrammarDataService,
    private _serverApi: ServerApiService,
    private _http: HttpClient,
    private _router: Router
  ) {}

  /**
   * Grammars that may be used for creation
   */
  public get availableGrammars() {
    return this._grammarData.list;
  }

  /**
   * Attempts to create the specified block language
   */
  public submitForm() {
    // We need to give the new language a default programming language
    // and only the grammar knows which language that may be.
    this._grammarData
      .getSingle(this.blockLanguage.grammarId)
      .pipe(first())
      .subscribe((g) => {
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

        this._http
          .post<{ id: string }>(
            this._serverApi.createBlockLanguageUrl(),
            toCreate
          )
          .subscribe(
            (res) => {
              this._serverData.listCache.refresh();
              this._router.navigateByUrl(`/admin/block-language/${res.id}`);
            },
            (err) => {
              console.log(err);
            }
          );
      });
  }
}
