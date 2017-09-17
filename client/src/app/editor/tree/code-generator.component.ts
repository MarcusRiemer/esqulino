import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

import { Node, Language, ValidationResult } from '../../shared/syntaxtree';

/**
 * Shows a compiled AST.
 */
@Component({
  templateUrl: 'templates/code-generator.html',
  selector: 'ast-code-generator'
})
export class CodeGeneratorComponent implements OnChanges {
  @Input() node: Node;
  @Input() language: Language;

  private _generated: string;

  /**
   * Any change will trigger a re-validation.
   */
  ngOnChanges(changes: SimpleChanges): void {
    this.refreshResult();
  }

  private refreshResult() {
    try {
      this._generated = this.language.emitTree(this.node);
    } catch (err) {
      this._generated = "";
    }
  }

  get generated() {
    return (this._generated);
  }
}
