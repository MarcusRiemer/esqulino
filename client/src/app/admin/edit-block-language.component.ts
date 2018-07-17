import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute, ParamMap } from '@angular/router'

import { switchMap, map, tap, first } from 'rxjs/operators';

import { ServerDataService } from '../shared/server-data.service';

import { BlockLanguageDescription } from '../shared/block/block-language.description';
import { prettyPrintBlockLanguage } from '../shared/block/prettyprint';

@Component({
  templateUrl: 'templates/edit-block-language.html'
})
export class EditBlockLanguageComponent implements OnInit {
  public editedSubject: BlockLanguageDescription;

  constructor(
    private _serverData: ServerDataService,
    private _activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this._activatedRoute.paramMap
      .pipe(
        map((params: ParamMap) => params.get('blockLanguageId')),
        switchMap((id: string) => this._serverData.getBlockLanguage(id).pipe(first())),
    ).subscribe(blockLanguage => {
      this.editedSubject = blockLanguage;
    });
  }

  /**
   * Compile the block language
   */
  prettyPrintBlockLanguage(blockLang: BlockLanguageDescription) {
    return (prettyPrintBlockLanguage(blockLang));
  }

  save() {
    this._serverData.updateBlockLanguage(this.editedSubject);
  }
}
