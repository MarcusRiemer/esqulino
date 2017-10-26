import { Component } from '@angular/core';

import { TreeEditorService } from './editor.service'

/**
 * Shows a compiled AST.
 */
@Component({
  templateUrl: 'templates/code-generator.html',
  selector: 'ast-code-generator'
})
export class CodeGeneratorComponent {

  constructor(private _treeService: TreeEditorService) { }

  get generated() {
    return (this._treeService.currentGeneratedCode);
  }
}
