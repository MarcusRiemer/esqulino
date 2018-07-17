import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { first } from 'rxjs/operators';

import { BlockLanguageDescription } from '../shared/block/block-language.description';
import {
  BlockLanguageGeneratorDescription, DEFAULT_GENERATOR
} from '../shared/block/generator.description'
import { generateBlockLanguage } from '../shared/block/generator'

import { ServerDataService } from '../shared/server-data.service';
import { ServerApiService } from '../shared/serverapi.service';

/**
 * A comprehensive way to create new block languages
 */
@Component({
  templateUrl: 'templates/create-block-language.html',
  selector: 'create-block-language'
})
export class CreateBlockLanguageComponent {
  // Synced with form
  public blockLanguage: BlockLanguageDescription = {
    id: undefined,
    name: "",
    slug: "",
    blockLanguageGeneratorId: "",
    defaultProgrammingLanguageId: "",
    grammarId: "",
    editorBlocks: [],
    editorComponents: [],
    sidebars: []
  };

  constructor(
    private _serverData: ServerDataService,
    private _serverApi: ServerApiService,
    private _http: HttpClient,
    private _router: Router,
  ) {
  }

  /**
   * Grammars that may be used for creation
   */
  public get availableGrammars() {
    return (this._serverData.listGrammars.value);
  }

  /**
   * Attempts to create the specified block language
   */
  public submitForm() {
    // We need to give the new language a default programming language
    // and only the grammar knows which language that may be.
    this._serverData
      .getGrammarDescription(this.blockLanguage.grammarId)
      .pipe(first())
      .subscribe(g => {
        // Generate some default blocks
        const toCreate = generateBlockLanguage(this.blockLanguage, DEFAULT_GENERATOR, g);

        // Default the default programming language to use the same value as
        // the grammar.
        toCreate.defaultProgrammingLanguageId = g.programmingLanguageId;

        this._http
          .post<{ id: string }>(this._serverApi.createBlockLanguageUrl(), toCreate)
          .subscribe(res => {
            this._serverData.listBlockLanguages.refresh();
            this._router.navigateByUrl(`/admin/block-language/${res.id}`);
          }, err => {
            console.log(err);
          });
      });
  }
}
