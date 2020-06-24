import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

import {
  ServerApiService,
  ListGrammarDataService,
} from "../../shared/serverdata";
import { LanguageService } from "../../shared/language.service";
import {CreateGrammarMutationGQL, CreateGrammarMutationMutationVariables} from "../../../generated/graphql";

/**
 * A comprehensive way to create new grammars
 */
@Component({
  templateUrl: "templates/create-grammar.html",
  selector: "create-grammar",
})
export class CreateGrammarComponent {
  // Synced with form
  grammar: CreateGrammarMutationMutationVariables = {
    name: "",
    slug: undefined,
    programmingLanguageId: "",
    root: { languageName: "", typeName: "" },
    types: {},
    foreignTypes: {},
  };

  constructor(
    private _serverData: ListGrammarDataService,
    private _serverApi: ServerApiService,
    private _languageService: LanguageService,
    private _http: HttpClient,
    private _router: Router,
    private _mutation: CreateGrammarMutationGQL,
  ) {}


  readonly availableProgrammingLanguages = this._languageService
    .availableLanguages;

  /**
   * Attempts to create the specified block language
   */
  public submitForm() {
    const toCreate: CreateGrammarMutationMutationVariables = JSON.parse(
      JSON.stringify(this.grammar)
    );
    if (!toCreate.slug) {
      delete toCreate.slug;
    }

    this._mutation.mutate(this.grammar).subscribe(
      (res) => {
        this._router.navigateByUrl(`/admin/grammar/${res.data.createGrammar.grammar.id}`);
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
