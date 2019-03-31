import { Component } from '@angular/core';

import { CurrentCodeResourceService } from '../../current-coderesource.service';

/**
 * Root of a block editor. Displays either the syntaxtree or a friendly message to
 * start programming.
 */
@Component({
  templateUrl: 'templates/block-root.html',
  selector: `block-root`
})
export class BlockRootComponent {
  constructor(
    private _currentCodeResource: CurrentCodeResourceService,
  ) { }

  /**
   * @return The resource that is currently edited
   */
  get currentResource() {
    return (this._currentCodeResource.currentResource);
  }
}