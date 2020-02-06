import { Component, OnInit } from '@angular/core'
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Observable, from } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';

import { GrammarDataService, ServerApiService } from '../../shared/serverdata';
import { GrammarDescription, CodeResource, CodeResourceDescription } from '../../shared';

@Component({
  templateUrl: 'templates/gallery-grammar.html'
})
export class GalleryGrammarComponent implements OnInit {

  constructor(
    private _http: HttpClient,
    private _activatedRoute: ActivatedRoute,
    private _grammarData: GrammarDataService,
    private _serverApi: ServerApiService
  ) { }

  ngOnInit() {

  }

  /**
   * The ID of the grammar that needs a gallery
   */
  private readonly grammarId$ = this._activatedRoute.paramMap.pipe(
    map((params: ParamMap) => params.get('grammarId'))
  );

  /**
   * The most recent version of the grammar that is available, may be newer
   * than the version on the server.
   */
  readonly grammar$: Observable<GrammarDescription> = this.grammarId$.pipe(
    switchMap(id => from(this._grammarData.getLocal(id, "request"))),
  )

  /**
   * All code resources that will be visualized in the gallery.
   */
  readonly codeResources$: Observable<CodeResource[]> = this.grammarId$.pipe(
    switchMap(id => this.createGrammarCodeResourceGalleryRequest(id)),
    map(descriptions => descriptions.map(d => new CodeResource(d))),
    startWith([]),
  );

  private createGrammarCodeResourceGalleryRequest(id: string) {
    const url = this._serverApi.individualGrammarCodeResourceGallery(id);
    return (this._http.get<CodeResourceDescription[]>(url));
  }
}