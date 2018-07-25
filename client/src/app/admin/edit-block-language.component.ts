import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, ParamMap } from '@angular/router'

import { switchMap, map, first } from 'rxjs/operators';

import { ServerDataService } from '../shared/server-data.service';

import { BlockLanguageDescription } from '../shared/block/block-language.description';
import { generateBlockLanguage } from '../shared/block/generator/generator'
import { prettyPrintBlockLanguage } from '../shared/block/prettyprint';

@Component({
  templateUrl: 'templates/edit-block-language.html'
})
export class EditBlockLanguageComponent implements OnInit {
  // The block language that is beeing edited.
  public editedSubject: BlockLanguageDescription;

  // Indicates whether the state of the editor is synchronized
  // with the rendered grammar.
  typesSynced = true;

  // The prettyprinted version of the block language
  prettyPrintedBlockLanguage = "";

  constructor(
    private _serverData: ServerDataService,
    private _activatedRoute: ActivatedRoute,
  ) {
  }

  readonly availableGrammars = this._serverData.listGrammars.value;

  /**
   * Ensures that a block language that matches the URL is loaded.
   */
  ngOnInit() {
    this._activatedRoute.paramMap
      .pipe(
        map((params: ParamMap) => params.get('blockLanguageId')),
        switchMap((id: string) => this._serverData.getBlockLanguage(id).pipe(first())),
    ).subscribe(blockLanguage => {
      this.editedSubject = blockLanguage;
      this.doPrettyPrint();
    });
  }

  /**
   * Reruns the block language generator.
   */
  onRegenerate() {
    this._serverData
      // Fetch the grammar 
      .getGrammarDescription(this.editedSubject.grammarId)
      // That is never required to be updated
      .pipe(first())
      .subscribe(g => {
        const instructions = this.editedSubject.localGeneratorInstructions || {};
        this.editedSubject = generateBlockLanguage(this.editedSubject, instructions, g);
        this.doPrettyPrint();
      });
  }

  /**
   * Saves the current state of the block language
   */
  onSave() {
    this._serverData.updateBlockLanguage(this.editedSubject);
  }

  /**
   * The data for the generator has been updated.
   */
  onGeneratorDataUpdate(text: string) {
    try {
      this.editedSubject.localGeneratorInstructions = JSON.parse(text);
      this.onRegenerate();
      this.typesSynced = true;
    } catch (e) {
      this.typesSynced = false;
    }
  }

  private doPrettyPrint() {
    this.prettyPrintedBlockLanguage = prettyPrintBlockLanguage(this.editedSubject);
  }
}
