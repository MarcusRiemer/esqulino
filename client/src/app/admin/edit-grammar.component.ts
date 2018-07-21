import { Component, OnInit, ViewChild } from '@angular/core'
import { Router, ActivatedRoute, ParamMap } from '@angular/router'

import { switchMap, map, tap, first } from 'rxjs/operators';

import { JsonEditorOptions, JsonEditorComponent } from 'ang-jsoneditor';

import { ServerDataService } from '../shared/server-data.service';
import { prettyPrintGrammar } from '../shared/syntaxtree/prettyprint';
import { GrammarDescription } from '../shared/syntaxtree';



@Component({
  templateUrl: 'templates/edit-grammar.html'
})
export class EditGrammarComponent implements OnInit {

  @ViewChild('typesEditor') editor: JsonEditorComponent;

  grammar: GrammarDescription;

  constructor(
    private _serverData: ServerDataService,
    private _activatedRoute: ActivatedRoute
  ) {
  }

  readonly editorOptions = new JsonEditorOptions();

  ngOnInit() {
    // Grab the first grammar from the server and do not update it if
    // the server data changes.
    this._activatedRoute.paramMap.pipe(
      map((params: ParamMap) => params.get('grammarId')),
      switchMap((id: string) => this._serverData.getGrammarDescription(id).pipe(first())),
    ).subscribe(g => this.grammar = g);

    // Options for the type editor
    this.editorOptions.sortObjectKeys = false;
    this.editorOptions.modes = ["tree", "text", "code"];
    this.editorOptions.mode = "code";
  }

  onTypeDataUpdate() {
    try {
      const newTypes = JSON.parse(this.editor.getText());
      this.grammar.types = newTypes;
    } catch (e) {
      alert("Konnte neue Typen nicht setzen");
    }
  }

  onSave() {
    this._serverData.updateGrammar(this.grammar);
  }

  /**
   * The compiled version of the grammar
   */
  get prettyPrintedGrammar() {
    return (prettyPrintGrammar(this.grammar));
  }
}
