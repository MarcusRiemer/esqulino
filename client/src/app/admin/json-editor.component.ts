import {
  Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges
} from '@angular/core';

// Pre-load relevant ace themes and modes
import 'brace/theme/sqlserver'
import 'brace/mode/json'

import 'brace/ext/searchbox'

/**
 * Allows more or less comfortable editing of JSON data
 */
@Component({
  templateUrl: 'templates/json-editor.html',
  selector: 'json-editor'
})
export class JsonEditor implements OnInit, OnChanges {
  @Input() jsonValue: any;
  @Output() jsonValueChange = new EventEmitter<any>();

  public isSynchronised = true;

  // This string is bound to the editor. It is initialized once, any further
  // updates requires explicit consent from the user as that would mean to
  // overwrite the current state of the editor.
  public jsonString = "";

  // This is the "live" version of the text. It should always be exactly
  // as represented in the editor.
  private _currentText: string;

  ngOnInit(): void {
    this.onUiOverwriteEditor();
  }

  /**
   *
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.jsonValue && !changes.jsonValue.firstChange) {
      this.checkSynchronisation();
    }
  }

  /**
   * The user has changed the text. We emit it if it appears to be valid
   * JSON data.
   */
  onTextChanged(newText: string) {
    this._currentText = newText;
    if (this.isSynchronised) {
      this.onEditorOverwriteUi();
    }
  }

  /**
   * Take the external state and make it our state.
   */
  onUiOverwriteEditor() {
    this.jsonString = JSON.stringify(this.jsonValue, undefined, 4);
    this._currentText = this.jsonString;
    this.checkSynchronisation();
  }

  /**
   * Take the internal state and force it onto the external state
   */
  onEditorOverwriteUi() {
    try {
      this.jsonValue = JSON.parse(this._currentText);
      this.jsonValueChange.emit(this.jsonValue);
      this.checkSynchronisation();
    } catch {
    }
  }

  /**
   *
   */
  private checkSynchronisation() {
    // Is there something that could be synchronized?
    if (this._currentText || this.jsonValue) {
      const ourValue = JSON.stringify(JSON.parse(this._currentText || null));
      const theirValue = JSON.stringify(this.jsonValue);
      this.isSynchronised = ourValue === theirValue;
    } else {
      this.isSynchronised = true;
    }
  }
}