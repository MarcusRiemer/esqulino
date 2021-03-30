import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, ParamMap } from "@angular/router";

import { Observable } from "rxjs";
import { map, switchMap, startWith, pluck } from "rxjs/operators";

import { FullGrammarGQL } from "../../../generated/graphql";

import { ServerApiService } from "../../shared/serverdata";
import {
  GrammarDescription,
  CodeResource,
  CodeResourceDescription,
} from "../../shared";
import { BlockLanguage } from "../../shared/block";
import { generateBlockLanguage } from "../../shared/block/generator/generator";
import { BlockLanguageListDescription } from "../../shared/block/block-language.description";
import { BlockLanguageGeneratorDocument } from "../../shared/block/generator/generator.description";
import { ResourceReferencesService } from "../../shared/resource-references.service";

@Component({
  templateUrl: "templates/gallery-grammar.html",
})
export class GalleryGrammarComponent implements OnInit {
  constructor(
    private _http: HttpClient,
    private _activatedRoute: ActivatedRoute,
    private _grammarData: FullGrammarGQL,
    private _serverApi: ServerApiService,
    private _resourceReferences: ResourceReferencesService
  ) {}

  ngOnInit() {}

  /**
   * The ID of the grammar that needs a gallery
   */
  private readonly grammarId$ = this._activatedRoute.paramMap.pipe(
    map((params: ParamMap) => params.get("grammarId"))
  );

  /**
   * The most recent version of the grammar that is available, may be newer
   * than the version on the server.
   */
  readonly grammar$: Observable<GrammarDescription> = this.grammarId$.pipe(
    switchMap((id) =>
      this._grammarData.fetch({ id }).pipe(pluck("data", "grammar"))
    )
  );

  /**
   * All code resources that will be visualized in the gallery.
   */
  readonly codeResources$: Observable<CodeResource[]> = this.grammarId$.pipe(
    switchMap((id) => this.createGrammarCodeResourceGalleryRequest(id)),
    map((descriptions) =>
      descriptions
        .slice(0, 10)
        .map((d) => new CodeResource(d, this._resourceReferences))
    ),
    startWith([])
  );

  /**
   * A automatically generated block language that is based on the grammar
   */
  readonly blockLanguage$: Observable<BlockLanguage> = this.grammar$.pipe(
    map((g) => {
      // We don't actually care too much about this part, the language is generated
      // on the fly and never persisted.
      const blockListDesc: BlockLanguageListDescription = {
        defaultProgrammingLanguageId: "generic",
        id: "artificial",
        grammarId: g.id,
        name: "artificial",
      };

      const genDesc: BlockLanguageGeneratorDocument = {
        type: "manual",
      };

      const blockDesc = generateBlockLanguage(blockListDesc, genDesc, g);
      console.log(`Generated block language for "${g.name}" grammar gallery`);
      return new BlockLanguage(blockDesc);
    })
  );

  private createGrammarCodeResourceGalleryRequest(id: string) {
    const url = this._serverApi.individualGrammarCodeResourceGallery(id);
    return this._http.get<CodeResourceDescription[]>(url);
  }
}
