import { Component, ViewChild, TemplateRef, AfterViewInit } from '@angular/core'

import { ServerDataService } from '../../shared'
import { ToolbarService } from '../../shared/toolbar.service'

import { EditBlockLanguageService } from './edit-block-language.service'

@Component({
  templateUrl: 'templates/edit-block-language.html',
  providers: [EditBlockLanguageService]
})
export class EditBlockLanguageComponent implements AfterViewInit {

  @ViewChild("toolbarButtons") toolbarButtons: TemplateRef<any>;

  constructor(
    private _serverData: ServerDataService,
    private _current: EditBlockLanguageService,
    private _toolbarService: ToolbarService
  ) {
  }

  /**
   * All grammars that may be selected for the edited block language.
   */
  readonly availableGrammars = this._serverData.listGrammars.value;

  /**
   * A readable version of the grammar that is beeing edited.
   */
  readonly prettyPrintedGrammar = this._current.baseGrammarPrettyPrinted;

  ngAfterViewInit() {
    this._toolbarService.setItems(this.toolbarButtons);
  }

  get baseGrammarId() {
    return (this.editedSubject.grammarId);
  }

  set baseGrammarId(id: string) {
    this._current.doUpdate(bl => {
      bl.grammarId = id;
    });
  }

  // The block language that is currently beeing edited.
  get editedSubject() {
    return (this._current.editedSubject);
  }

  // All errors that occured during generation
  get generatorErrors() {
    return (this._current.generatorErrors);
  }

  // The pretty printed version of the block language
  get prettyPrintedBlockLanguage() {
    return (this._current.prettyPrintedBlockLanguage);
  }

  /**
   * Reruns the block language generator.
   */
  onRegenerate() {
    this._current.regenerate();
  }

  /**
   * Saves the current state of the block language
   */
  onSave() {
    this._current.save();
  }

  /**
   * The data for the generator has been updated.
   */
  onGeneratorDataUpdate(json: any) {
    this._current.updateGeneratorData(json);
  }
}
