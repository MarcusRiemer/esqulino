import { Component } from '@angular/core';

import { TreeEditorService } from './editor.service'

/**
 * Informs the user about possible errors in his trees,
 */
@Component({
  templateUrl: 'templates/validation.html',
  selector: 'ast-validation'
})
export class ValidationComponent {

  constructor(private _treeService: TreeEditorService) { }

  get result() {
    return (this._treeService.currentValidationResult);
  }
}

