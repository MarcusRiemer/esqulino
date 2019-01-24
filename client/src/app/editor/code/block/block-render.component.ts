import { Component, Input } from '@angular/core';

import { Node, CodeResource } from '../../../shared/syntaxtree';
import { VisualBlockDescriptions } from '../../../shared/block';

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

  /**
   * @return True, if there should be a break after this element
   */
  get breakAfter() {
    return (this.visual && !!this.visual.breakAfter);
  }

  /**
   * @return The blocks that should be rendered between iterated blocks
   */
  get iteratorSeparatorBlocks() {
    if (VisualBlockDescriptions.isEditorIterator(this.visual)) {
      return (this.visual.between || []);
    } else {
      return ([]);
    }
  }

  /**
   * @return The actual nodes that should be displayed.
   */
  get iteratorChildNodes() {
    if (VisualBlockDescriptions.isEditorIterator(this.visual)) {
      return (this.node.getChildrenInCategory(this.visual.childGroupName));
    } else {
      return ([]);
    }
  }

  /**
   * @return The visual editor block that should be used to represent the given node.
   */
  iteratorGetEditorBlock(node: Node) {
    return (this.codeResource.blockLanguagePeek.getEditorBlock(node.qualifiedName));
  }

  readonly defaultBetweenDropTarget: VisualBlockDescriptions.EditorDropTarget = {
    blockType: "dropTarget",
    dropTarget: {
      self: {
        order: "insertAfter",
        skipParents: 0
      }
    },
    direction: "horizontal"
  };
}
