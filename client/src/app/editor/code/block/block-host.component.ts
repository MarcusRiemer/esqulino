import { Component, Input, HostBinding } from '@angular/core';

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

  @Input()
  codeResource: CodeResource;

  /**
   * The node that represents the root of the tree to display.
   */
  @Input()
  node: Node;

  /**
   * Optionally override the block language that comes with the code resource.
   */
  @Input()
  blockLanguage?: BlockLanguage;

  /**
   * Disables any interaction with this block if true.
   */
  @Input()
  readOnly = false;

  @HostBinding('class')
  get hostCssClasses() {
    return (this.usedBlockLanguage.rootCssClasses.join(" "));
  }

  /**
   * @return The visual editor block that should be used to represent the node.
   */
  get editorBlock() {
    return (this.usedBlockLanguage.getEditorBlock(this.node.qualifiedName));
  }

  /**
   * @return The block language that should be used to represent the node
   */
  get usedBlockLanguage() {
    return (this.blockLanguage || this.codeResource.blockLanguagePeek);
  }
}
