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

  jsonString = "";

  ngOnInit(): void {
    this.jsonString = JSON.stringify(this.jsonValue, undefined, 4);
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
    try {
      this.jsonValueChange.emit(JSON.parse(newText));
    } catch {
    }
  }

  private checkSynchronisation() {
    const ourValue = JSON.stringify(JSON.parse(this.jsonString));
    const theirValue = JSON.stringify(this.jsonValue);
    this.isSynchronised = ourValue === theirValue;
  }
}
