import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

import { Node, Language, AvailableLanguages, ValidationResult } from '../../shared/syntaxtree'

@Component({
  templateUrl: 'templates/validation.html',
  selector: 'ast-validation'
})
export class ValidationComponent implements OnChanges {
  @Input() node: Node;
  @Input() language: Language;

  private _validationResult: ValidationResult;

  ngOnChanges(changes: SimpleChanges): void {
    this.refreshResult();
  }

  private refreshResult() {
    this._validationResult = this.language.validateTree(this.node);
  }

  get result() {
    return (this._validationResult);
  }
}

