import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { map, first, pluck } from "rxjs/operators";

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
    rootCssClasses: [],
  };

  // Enables usage of slugs
  useSlug = false;

  constructor(
    private _router: Router,
    private _createBlockLanguageGQL: CreateBlockLanguageGQL,
    private _grammarSelectionGQL: SelectionListGrammarsGQL,
    private _grammarGQL: GrammarDescriptionItemGQL
  ) {}

  readonly availableGrammars$ = this._grammarSelectionGQL
    .watch()
    .valueChanges.pipe(map((response) => response.data.grammars.nodes));

  /**
   * Attempts to create the specified block language
   */
  async submitForm() {
    // We need to give the new language a default programming language
    // and only the grammar knows which language that may be. Additionally
    // fetching the whole grammar here allows us to generate some blocks.
    const g = await this._grammarGQL
      .fetch({ id: this.blockLanguage.grammarId })
      .pipe(first(), pluck("data", "grammars", "nodes", 0))
      .toPromise();

    // Generate some default blocks
    const toCreate = Object.assign(
      {},
      this.blockLanguage,
      generateBlockLanguage(DEFAULT_GENERATOR, g)
    );

    // Default the default programming language to use the same value as
    // the grammar.
    toCreate.defaultProgrammingLanguageId = g.programmingLanguageId;

    // Possibly forcefully remove a slug (instead of sending an empty string)
    if (!this.useSlug) {
      delete toCreate.slug;
    }

    const res = await this._createBlockLanguageGQL
      .mutate(toCreate)
      .pipe(first(), pluck("data", "createBlockLanguage"))
      .toPromise();

    this._router.navigateByUrl(`/admin/block-language/${res.id}`);
  }
}
