import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

import { Tree, Language, ValidationResult } from '../../shared/syntaxtree'

/**
 * Informs the user about possible errors in his trees,
 */
@Component({
  templateUrl: 'templates/validation.html',
  selector: 'ast-validation'
})
export class ValidationComponent implements OnChanges {
  @Input() tree: Tree;
  @Input() language: Language;

  // The result is cached
  private _validationResult: ValidationResult;

  /**
   * Any change will trigger a re-validation.
   */
  ngOnChanges(changes: SimpleChanges): void {
    this.refreshResult();
  }

  /**
   * Attempts to re-validate the tree.
   */
  private refreshResult() {
    try {
      this._validationResult = this.language.validateTree(this.tree);
    } catch (e) {
      this._validationResult = ValidationResult.EMPTY;
    }
  }

  get result() {
    return (this._validationResult);
  }
}

