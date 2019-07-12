import { Component, Input } from '@angular/core';

import { Node, CodeResource } from '../../../shared/syntaxtree';
import { BlockLanguage } from '../../../shared/block';

/**
 * Renders all editor blocks that are mandated by the given node.
 */
@Component({
  templateUrl: 'templates/block-host.html',
  selector: `editor-block-host`
})
export class BlockHostComponent {

  @Input() public codeResource: CodeResource;

  /**
   * The node that represents the root of the tree to display.
   */
  @Input() public node: Node;

  /**
   * Optionally override the block language that comes with the code resource.
   */
  @Input() public blockLanguage?: BlockLanguage;

  /**
   * Disables any interaction with this block if true.
   */
  @Input() public readOnly = false;

  /**
   * @return The visual editor block that should be used to represent the node.
   */
  get editorBlock() {
    const bl = this.blockLanguage || this.codeResource.blockLanguagePeek;
    return (bl.getEditorBlock(this.node.qualifiedName));
  }
}
