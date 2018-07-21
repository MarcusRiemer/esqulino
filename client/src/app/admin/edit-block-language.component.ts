import { Component, OnInit, ViewChild } from '@angular/core'
import { Router, ActivatedRoute, ParamMap } from '@angular/router'

import { switchMap, map, tap, first } from 'rxjs/operators';

import { JsonEditorComponent } from 'ang-jsoneditor';

import { ServerDataService } from '../shared/server-data.service';

import { BlockLanguageDescription } from '../shared/block/block-language.description';
import { DEFAULT_GENERATOR } from '../shared/block/generator/generator.description'
import { generateBlockLanguage } from '../shared/block/generator/generator'
import { prettyPrintBlockLanguage } from '../shared/block/prettyprint';

import { defaultJsonEditorOptions } from './json-editor'

@Component({
  templateUrl: 'templates/edit-block-language.html'
})
export class EditBlockLanguageComponent implements OnInit {
  // The block language that is beeing edited.
  public editedSubject: BlockLanguageDescription;


  @ViewChild('sidebarsEditor') sidebarsEditor: JsonEditorComponent;
  readonly editorOptions = defaultJsonEditorOptions();

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
    });
  }

  /**
   * Prettyprints the given block language
   */
  prettyPrintBlockLanguage(blockLang: BlockLanguageDescription) {
    return (prettyPrintBlockLanguage(blockLang));
  }

  /**
   * Reruns the block language generator.
   */
  onRegenerate() {
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
  onSave() {
    this._serverData.updateBlockLanguage(this.editedSubject);
  }

  onSidebarDataUpdate() {
    this.editedSubject.sidebars = JSON.parse(this.sidebarsEditor.getText());
  }
}
