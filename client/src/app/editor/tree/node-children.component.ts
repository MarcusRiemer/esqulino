import { Observable } from 'rxjs';

import { Component, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { Node, NodeLocation } from '../../shared/syntaxtree';

import { DragService } from './drag.service';
import { TreeService } from './tree.service';


@Component({
  templateUrl: 'templates/node-children.html',
  selector: 'ast-node-children',
  animations: [
    trigger('dropPlaceholder', [
      state('none', style({
        transform: 'scale(0.5)',
        display: 'none',
        backgroundColor: 'white',
      })),
      state('available', style({
        transform: 'scale(1.0)',
        display: 'block',
        backgroundColor: 'lime',
      })),
      state('self', style({
        transform: 'scale(1.0)',
        display: 'block',
        backgroundColor: 'yellow',
      })),
    ])
  ]
})
export class NodeChildrenComponent {

  @Input() categoryName: string;

  @Input() nodes: Node[];

  @Input() parent: Node;

  constructor(
    private _dragService: DragService,
    private _treeService: TreeService
  ) { }

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
