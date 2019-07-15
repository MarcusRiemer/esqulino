import { Component } from '@angular/core';

import { CurrentCodeResourceService } from '../../current-coderesource.service';
import { DragService } from '../../drag.service';

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
    private _dragService: DragService,
  ) { }

  /**
   * @return The resource that is currently edited
   */
  readonly currentResource$ = this._currentCodeResource.currentResource;

  readonly currentBlockLanguage$ = this._currentCodeResource.currentBlockLanguage;



  /**
   * When something draggable enters the empty area a program may start with,
   * there is not actually a node that could be referenced.
   */
  public onPlaceholderDragEnter(evt: MouseEvent) {
    if (this._dragService.peekIsDragInProgress) {
      this._dragService.informDraggedOver(evt, [], undefined, {
        allowExact: true
      });
    }
  }
}