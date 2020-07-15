import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

import { map } from "rxjs/operators";

import { BlockLanguageDescription } from "../../shared/block/block-language.description";
import { DEFAULT_GENERATOR } from "../../shared/block/generator/generator.description";
import { generateBlockLanguage } from "../../shared/block/generator/generator";

import {
  CreateBlockLanguageGQL,
  GrammarDescriptionItemGQL,
  SelectionListGrammarsGQL,
} from "../../../generated/graphql";

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
    private _router: Router,
    private _createBlockLanguageGQL: CreateBlockLanguageGQL,
    private _grammarSelection: SelectionListGrammarsGQL,
    private _grammarData: GrammarDescriptionItemGQL
  ) {}

  readonly availableGrammars$ = this._grammarSelection
    .watch()
    .valueChanges.pipe(map((response) => response.data.grammars.nodes));

  /**
   * Attempts to create the specified block language
   */
  async submitForm() {
    // We need to give the new language a default programming language
    // and only the grammar knows which language that may be.
    const g = await this._grammarData
      .fetch({ id: this.blockLanguage.grammarId })
      .pipe(map((response) => response.data.singleGrammar))
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

    this._createBlockLanguageGQL
      .mutate(toCreate)
      .pipe(map((response) => response.data.createBlockLanguage))
      .subscribe((res) => {
        this._router.navigateByUrl(`/admin/block-language/${res.id}`);
      });
  }
}
