import { Observable } from 'rxjs';

import { Component, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { Node, NodeLocation } from '../../shared/syntaxtree';
import { arrayEqual } from '../../shared/util'

import { DEFAULT_ANIMATION } from './node.animation'
import { DragService } from './drag.service';
import { TreeService } from './tree.service';


/**
 * Displays a group of nodes with placeholders spread out between them.
 */
@Component({
  templateUrl: 'templates/node-children.html',
  selector: 'ast-node-children',
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
export class NodeChildrenComponent {

  // The name of the category these nodes are a part of
  @Input() categoryName: string;

  // The actual nodes to display
  @Input() nodes: Node[];

  // The node that is the parenting node for all of these nodes
  @Input() parent: Node;

  // TODO: Cache observables
  private _cached_stateObservablesPlaceholder: { [loc: string]: Observable<string> } = {};

  constructor(
    private _dragService: DragService,
    private _treeService: TreeService
  ) { }

  /**
   * @return An observable that emits the display state for a specific location.
   */
  getDisplayStateForPlaceholder(loc: NodeLocation): Observable<string> {
    const key = JSON.stringify(loc);
    if (!(key in this._cached_stateObservablesPlaceholder)) {
      this._cached_stateObservablesPlaceholder[key] = this._dragService.currentDragOverPlaceholder
        .merge(this._dragService.isDragInProgress)
        .map(curr => {
          if (arrayEqual(curr as any, loc)) {
            return ('self')
          } else if (this._dragService.peekIsDragInProgress) {
            return ('available')
          } else {
            return ('none');
          }
        })
        .do(curr => console.log(`New state: ${JSON.stringify(loc)} => ${curr}`));
      console.log(`New observable: ${JSON.stringify(loc)}`);
    }
    return (this._cached_stateObservablesPlaceholder[key]);
  }

  /**
   * Something has been dropped on a placeholder in an empty category of this node.
   */
  onDropInsert(loc: NodeLocation) {
    const desc = this._dragService.peekDragData.draggedDescription;
    this._treeService.insertNode(loc, desc);
  }

  /**
   * @return The number of nodes this group has.
   */
  get childGroupLength() {
    return (this.parent.children[this.categoryName].length);
  }

  /**
   * @return The location that points to the first free index inside this category.
   */
  get lastLocation() {
    return ([...this.parent.location, [this.categoryName, this.childGroupLength]]);
  }

}
