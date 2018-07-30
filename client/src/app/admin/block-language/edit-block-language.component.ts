import { Component, ViewChild, TemplateRef, AfterViewInit } from '@angular/core'

import { ServerDataService } from '../../shared/server-data.service'

import { ToolbarService } from '../toolbar.service'

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

  readonly availableGrammars = this._serverData.listGrammars.value;

  ngAfterViewInit() {
    this._toolbarService.setItems(this.toolbarButtons);
  }

  // The block language that is currently beeing edited.
  get editedSubject() {
    return (this._current.editedSubject);
  }

  get generatorErrors() {
    return (this._current.generatorErrors);
  }

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
    this._current.onSave();
  }

  /**
   * The data for the generator has been updated.
   */
  onGeneratorDataUpdate(json: any) {
    this._current.onGeneratorDataUpdate(json);
  }
}
