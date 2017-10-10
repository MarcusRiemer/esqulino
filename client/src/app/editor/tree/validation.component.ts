import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

import { Tree, Language, ValidationResult } from '../../shared/syntaxtree'

import { TreeService } from './tree.service'

/**
 * Informs the user about possible errors in his trees,
 */
@Component({
  templateUrl: 'templates/validation.html',
  selector: 'ast-validation'
})
export class ValidationComponent {

  constructor(private _treeService: TreeService) {

  }

  get result() {
    return (this._treeService.currentValidationResult);
  }
}

