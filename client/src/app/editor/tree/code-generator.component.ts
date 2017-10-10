import { Component } from '@angular/core';

import { TreeService } from './tree.service'

/**
 * Shows a compiled AST.
 */
@Component({
  templateUrl: 'templates/code-generator.html',
  selector: 'ast-code-generator'
})
export class CodeGeneratorComponent {

  constructor(private _treeService: TreeService) { }

  get generated() {
    return (this._treeService.currentGeneratedCode);
  }
}
