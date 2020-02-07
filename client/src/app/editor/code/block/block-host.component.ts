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
   * The block language to display this tree
   */
  @Input()
  blockLanguage: BlockLanguage;

  /**
   * Disables any interaction with this block if true.
   */
  @Input()
  readOnly = false;

  @HostBinding('class')
  get hostCssClasses() {
    return (this.blockLanguage.rootCssClasses.join(" "));
  }

  /**
   * @return The visual editor block that should be used to represent the node.
   */
  get editorBlock() {
    return (this.blockLanguage.getEditorBlock(this.node.qualifiedName));
  }
}
