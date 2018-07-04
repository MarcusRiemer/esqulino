import { Component, Input } from '@angular/core';

import { Node, NodeLocation, Tree, CodeResource } from '../../../shared/syntaxtree';
import { BlockLanguage, VisualBlockDescriptions } from '../../../shared/block';

/**
 * Renders a single and well known visual element of a node.
 */
@Component({
  templateUrl: 'templates/block-render.html',
  selector: `editor-block-render`
})
export class BlockRenderComponent {
  @Input() public codeResource: CodeResource;
  @Input() public node: Node;
  @Input() public visual: VisualBlockDescriptions.EditorBlockBase;

  /**
   * Dirty Hack: Template "Typecast"
   */
  asBlockConstant(block: VisualBlockDescriptions.EditorBlockBase) {
    return (block as VisualBlockDescriptions.EditorConstant);
  }

  /**
   * Dirty Hack: Template "Typecast"
   */
  asBlockInterpolated(block: VisualBlockDescriptions.EditorBlockBase) {
    return (block as VisualBlockDescriptions.EditorInterpolated);
  }

  /**
   * Dirty Hack: Template "Typecast"
   */
  asBlockInput(block: VisualBlockDescriptions.EditorInput) {
    return (block as VisualBlockDescriptions.EditorInput);
  }
}
