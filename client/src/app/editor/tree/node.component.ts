import { Component, Input, OnInit } from '@angular/core';

import { Node } from '../../shared/syntaxtree'

@Component({
  templateUrl: 'templates/node.html',
  selector: 'ast-node'
})
export class NodeComponent {
  @Input() node: Node;

  get properties() {
    return (Object.entries(this.node.properties).map(([key, value]) => {
      return ({
        key: key,
        value: value
      });
    }));
  }

  /**
   * @return All categories that have children with their children.
   */
  get childrenCategories() {
    return (Object.entries(this.node.children).map(([key, children]) => {
      return ({
        categoryName: key,
        nodes: children
      });
    }));
  }
}
