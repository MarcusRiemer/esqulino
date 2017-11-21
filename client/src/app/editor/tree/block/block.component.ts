import { Component, Input } from '@angular/core';

import { Node, NodeLocation, Tree } from '../../../shared/syntaxtree';
import { LanguageModel, SidebarBlock } from '../../../shared/block';

@Component({
  templateUrl: `templates/block.html`,
  selector: `editor-block`
})
export class BlockComponent {

  @Input() public languageModel: LanguageModel;
  @Input() public node: Node;

  /**
   * @return Instructions how to represent the current node.
   */
  get editorBlock() {
    return (this.languageModel.getEditorBlock(this.node.qualifiedName));
  }

}
