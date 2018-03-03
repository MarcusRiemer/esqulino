import { Component, Input } from '@angular/core';

import { Node, NodeLocation, Tree, CodeResource } from '../../../shared/syntaxtree';
import { BlockLanguage, EditorBlockDescription } from '../../../shared/block';

/**
 * Renders all editor blocks that are mandated by the given node.
 */
@Component({
  templateUrl: 'templates/block-host.html',
  selector: `editor-block-host`
})
export class BlockHostComponent {

  @Input() public codeResource: CodeResource;
  @Input() public node: Node;

  /**
   * @return The visual editor block that should be used to represent the node.
   */
  get editorBlock() {
    return (this.codeResource.blockLanguagePeek.getEditorBlock(this.node.qualifiedName));
  }
}
