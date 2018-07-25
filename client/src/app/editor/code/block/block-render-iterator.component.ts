import { Component, Input } from '@angular/core';

import { Node, CodeResource } from '../../../shared/syntaxtree';
import { VisualBlockDescriptions } from '../../../shared/block';

/**
 * Renders specific children of a certain child group. Also takes care
 * of reordering or inserting elements.
 */
@Component({
  templateUrl: 'templates/block-render-iterator.html',
  selector: `editor-block-render-iterator`,
})
export class BlockRenderIteratorComponent {
  @Input() public codeResource: CodeResource;
  @Input() public node: Node;
  @Input() public visual: VisualBlockDescriptions.EditorIterator;

  /**
   * @return The blocks that should be rendered between iterated blocks
   */
  get separatorBlocks() {
    return (this.visual.between || []);
  }

  /**
   * @return The actual nodes that should be displayed.
   */
  get childNodes() {
    return (this.node.getChildrenInCategory(this.visual.childGroupName));
  }
}
