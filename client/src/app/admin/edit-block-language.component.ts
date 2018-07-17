import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute, ParamMap } from '@angular/router'

import { switchMap, map, tap, first } from 'rxjs/operators';

import { ServerDataService } from '../shared/server-data.service';

import { BlockLanguageDescription } from '../shared/block/block-language.description';
import { DEFAULT_GENERATOR } from '../shared/block/generator.description'
import { generateBlockLanguage } from '../shared/block/generator'
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

  readonly availableGrammars = this._serverData.listGrammars.value;

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
   * Prettyprints the given block language
   */
  prettyPrintBlockLanguage(blockLang: BlockLanguageDescription) {
    return (prettyPrintBlockLanguage(blockLang));
  }

  regenerate() {
    this._serverData
      .getGrammarDescription(this.editedSubject.grammarId)
      .pipe(first())
      .subscribe(g => {
        this.editedSubject = generateBlockLanguage(this.editedSubject, DEFAULT_GENERATOR, g);
      });
  }

  /**
   * Saves the current state of the block language
   */
  save() {
    this._serverData.updateBlockLanguage(this.editedSubject);
  }
}
