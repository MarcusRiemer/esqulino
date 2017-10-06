import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

import { Tree, Language, ValidationResult } from '../../shared/syntaxtree';

/**
 * Shows a compiled AST.
 */
@Component({
  templateUrl: 'templates/code-generator.html',
  selector: 'ast-code-generator'
})
export class CodeGeneratorComponent implements OnChanges {
  @Input() tree: Tree;
  @Input() language: Language;

  // The generated code is cached
  private _generated: string;

  /**
   * Any change will trigger a re-validation.
   */
  ngOnChanges(changes: SimpleChanges): void {
    this.refreshResult();
  }

  private refreshResult() {
    try {
      console.log("Refreshing compilation ...");
      this._generated = this.language.emitTree(this.tree);
      console.log("Refreshed compilation!");
    } catch (err) {
      console.log(`Error refreshing compilation: "${err}"`);
      this._generated = "";
    }
  }

  get generated() {
    return (this._generated);
  }
}
