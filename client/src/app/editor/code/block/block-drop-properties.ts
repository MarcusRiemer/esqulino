import { NodeLocation, CodeResource } from '../../../shared/syntaxtree';
import { VisualBlockDescriptions } from '../../../shared/block';

/**
 * Common interface for blocks and drop targets. As both of these require
 * must react to the same class of events they have quite a few properties
 * in common.
 */
export interface BlockDropProperties {
  // The location dragged things would be inserted when dropped here.
  readonly dropLocation: NodeLocation;

  // The description that is used to render this block.
  readonly visual: VisualBlockDescriptions.EditorDropTarget | VisualBlockDescriptions.EditorBlock;

  // The resource that is visualised
  readonly codeResource: CodeResource;
}
