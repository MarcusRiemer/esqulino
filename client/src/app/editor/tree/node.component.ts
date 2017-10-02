import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { Node } from '../../shared/syntaxtree';

import { DragService } from './drag.service';

@Component({
  templateUrl: 'templates/node.html',
  selector: 'ast-node',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeComponent implements OnInit {
  @Input() node: Node;

  // Immutable cache for properties
  private _properties: { key: string, value: string }[];

  // Immutable cache for children categories
  private _childrenCategories: { categoryName: string, nodes: Node[] }[];

  constructor(private _dragService: DragService) { }

  /**
   * Sets up display friendly caches of properties and children categories.
   */
  ngOnInit() {
    console.log("ngOnInit for node");

    this._properties = Object.entries(this.node.properties).map(([key, value]) => {
      return ({ key: key, value: value });
    });

    this._childrenCategories = Object.entries(this.node.children).map(([key, children]) => {
      return ({ categoryName: key, nodes: children });
    });
  }

  /**
   * @return All properties with their values
   */
  get properties() {
    return (this._properties);
  }

  /**
   * @return All categories that have children with their children.
   */
  get childrenCategories() {
    return (this._childrenCategories);
  }

  get isDragInProgress() {
    return (this._dragService.isDragInProgress);
  }
}
