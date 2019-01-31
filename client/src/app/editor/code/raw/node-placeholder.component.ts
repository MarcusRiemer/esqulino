import { Component, Input } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { NodeLocation } from '../../../shared/syntaxtree';
import { arrayEqual } from '../../../shared/util';

import { DragService } from '../../drag.service';
import { CurrentCodeResourceService } from '../../current-coderesource.service';

import { DROP_PLACEHOLDER_ANIMATION } from './node.animation';


/**
 * Displays a group of nodes with placeholders spread out between them.
 */
@Component({
  templateUrl: 'templates/node-placeholder.html',
  selector: 'ast-node-placeholder',
  animations: [DROP_PLACEHOLDER_ANIMATION]
})
export class NodePlaceholderComponent {

  // The location this placeholder is shown in
  @Input() location: NodeLocation;

  // Sometimes it might be feasible to display placeholders all the time.
  @Input() alwaysVisible = false;

  private _cached_animationState: Observable<string>;

  constructor(
    private _dragService: DragService,
    private _currentCodeResource: CurrentCodeResourceService
  ) { }

  /**
   * @return An observable that emits the display state for a specific location.
   */
  get animationState(): Observable<string> {
    if (!this._cached_animationState) {
      this._cached_animationState = this._dragService.currentDrag
        .pipe(
          map(curr => {
            if (!curr)
              // There is no drag operation
              return (this.alwaysVisible ? "available" : "none");
            else if (arrayEqual(curr.dropLocation, this.location))
              // There is a drag operation and it targets us
              return ("self");
            else
              // There is a drag operation and it targets something else
              return ("available");
          })
        );
    }
    return (this._cached_animationState);
  }

  /**
   * Something has been dropped on a placeholder in an empty category of this node.
   */
  onDropInsert() {
    const desc = this._dragService.peekDragData.draggedDescription;
    this._currentCodeResource.peekResource.insertNode(this.location, desc);
  }
}
