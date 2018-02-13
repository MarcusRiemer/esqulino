import { Observable } from 'rxjs';

import { Component, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { Node, NodeLocation, Tree, CodeResource } from '../../../shared/syntaxtree';
import { BlockLanguage, VisualBlockDescriptions } from '../../../shared/block';

import { DragService } from '../../drag.service';

import { TreeEditorService } from '../../editor.service';

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

  constructor(
    private _dragService: DragService,
    private _treeService: TreeEditorService,
  ) {
  }

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
