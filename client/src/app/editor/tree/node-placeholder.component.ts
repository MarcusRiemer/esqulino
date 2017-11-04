import { Observable } from 'rxjs';

import { Component, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { Node, NodeLocation } from '../../shared/syntaxtree';
import { arrayEqual } from '../../shared/util'

import { DEFAULT_ANIMATION } from './node.animation'
import { DragService } from './drag.service';
import { TreeEditorService } from './editor.service';

/**
 * Displays a group of nodes with placeholders spread out between them.
 */
@Component({
  templateUrl: 'templates/node-placeholder.html',
  selector: 'ast-node-placeholder',
  animations: [
    trigger('dropPlaceholder', [
      state('none', style({
        transform: 'scaleY(0.0)',
        height: '0px',
        display: 'none',
        backgroundColor: 'white',
      })),
      state('available', style({
        transform: 'scaleY(1.0)',
        height: 'auto',
        display: 'block',
        backgroundColor: 'lime',
      })),
      state('self', style({
        transform: 'scaleY(1.0)',
        height: 'auto',
        display: 'block',
        backgroundColor: 'yellow',
      })),
      // Fade in and out
      transition('none <=> available', animate(DEFAULT_ANIMATION)),
      transition('none <=> self', animate(DEFAULT_ANIMATION)),

      // Transition between shown states
      transition('available => self', animate(DEFAULT_ANIMATION)),
    ])
  ]
})
export class NodePlaceholderComponent {

  // The location this placeholder is shown in
  @Input() location: NodeLocation;

  // TODO: Cache observables
  private _cached_animationState: Observable<string>;

  constructor(
    private _dragService: DragService,
    private _treeService: TreeEditorService
  ) { }

  /**
   * @return An observable that emits the display state for a specific location.
   */
  get animationState(): Observable<string> {
    if (!this._cached_animationState) {
      this._cached_animationState = this._dragService.currentDragOverPlaceholder
        .merge(this._dragService.isDragInProgress)
        .map(curr => {
          if (arrayEqual(curr as any, this.location)) {
            return ('self')
          } else if (this._dragService.peekIsDragInProgress) {
            return ('available')
          } else {
            return ('none');
          }
        })
        .do(curr => console.log(`New state: ${JSON.stringify(this.location)} => ${curr}`));
      console.log(`New observable: ${JSON.stringify(this.location)}`);
    }
    return (this._cached_animationState);
  }

  /**
   * Something has been dropped on a placeholder in an empty category of this node.
   */
  onDropInsert() {
    const desc = this._dragService.peekDragData.draggedDescription;
    this._treeService.peekTree.insertNode(this.location, desc);
  }
}
