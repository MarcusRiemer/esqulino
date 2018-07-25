import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

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
export class JsonEditor implements OnInit {
  @Input() jsonValue: any;
  @Output() jsonValueChange = new EventEmitter<any>();

  jsonString = "";

  ngOnInit(): void {
    this.jsonString = JSON.stringify(this.jsonValue, undefined, 4);
  }

  onTextChanged(newText: string) {
    try {
      this.jsonValueChange.emit(JSON.parse(newText));
    } catch {
    }
  }
}
