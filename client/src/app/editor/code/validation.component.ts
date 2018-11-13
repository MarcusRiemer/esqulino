import { Component } from '@angular/core';

import { CurrentCodeResourceService } from '../current-coderesource.service';

import { CodeResource } from '../../shared/syntaxtree';

/**
 * Informs the user about possible errors in his trees,
 */
@Component({
  templateUrl: 'templates/validation.html',
  selector: 'ast-validation'
})
export class ValidationComponent {

  constructor(
    private _currentCodeResource: CurrentCodeResourceService
  ) { }

  readonly codeResource = this._currentCodeResource.currentResource
}
