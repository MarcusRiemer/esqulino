import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { LanguageService } from "../../shared/language.service";
import {
  CreateGrammarGQL,
  CreateGrammarMutationVariables,
} from "../../../generated/graphql";

/**
 * A comprehensive way to create new grammars
 */
@Component({
  templateUrl: "templates/create-grammar.html",
  selector: "create-grammar",
})
export class CreateGrammarComponent {
  // Synced with form
  grammar: CreateGrammarMutationVariables = {
    name: "",
    slug: undefined,
    programmingLanguageId: "",
    root: { languageName: "", typeName: "" },
    types: {},
    foreignTypes: {},
  };

  constructor(
    private _languageService: LanguageService,
    private _router: Router,
    private _mutation: CreateGrammarGQL
  ) {}

  readonly availableProgrammingLanguages = this._languageService
    .availableLanguages;

  /**
   * Attempts to create the specified block language
   */
  public submitForm() {
    const toCreate: CreateGrammarMutationVariables = JSON.parse(
      JSON.stringify(this.grammar)
    );
    if (!toCreate.slug) {
      delete toCreate.slug;
    }

    this._mutation.mutate(this.grammar).subscribe(
      (res) => {
        this._router.navigateByUrl(
          `/admin/grammar/${res.data.createGrammar.grammar.id}`
        );
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
