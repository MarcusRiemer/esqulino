import { Observable } from 'rxjs';

import { Component, Input } from '@angular/core';

import { Node } from '../../../shared/syntaxtree';

import { DragService } from '../../drag.service';

import { TreeEditorService } from '../../editor.service';

/**
 * Displays a group of nodes with placeholders spread out between them.
 */
@Component({
  templateUrl: 'templates/node-children.html',
  selector: 'ast-node-children',
})
export class NodeChildrenComponent {

  // The name of the category these nodes are a part of
  @Input() categoryName: string;

  // The actual nodes to display
  @Input() nodes: Node[];

  // The node that is the parenting node for all of these nodes
  @Input() parent: Node;

  constructor(
    private _dragService: DragService,
    private _treeService: TreeEditorService
  ) { }

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
