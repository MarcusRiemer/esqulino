import { QualifiedTypeName, NodeLocation, CodeResource } from '../../../shared/syntaxtree';
import { embraceNode } from '../../../shared/syntaxtree/drop-embrace';
import { VisualBlockDescriptions } from '../../../shared/block';
import { Restricted } from '../../../shared/block/bool-mini-expression.description'
import { evalExpression } from '../../../shared/block/bool-mini-expression'
import { arrayEqual } from '../../../shared/util';

import { CurrentDrag } from '../../drag.service';

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

/**
 * These states control how a drop target should react to a drag
 * operation. "none" means the location wouldn't be valid, "self"
 * if the operation is currently over the target itself and
 * "available" signals ... well ... availability to the drag.
 */
export type DropTargetState = "none" | "self" | "visible" | "available"

/**
 * @return The name of the referenced child group (if there is any)
 */
function dropLocationChildGroupName(blockDrop: BlockDropProperties): string {
  const dropLocation = blockDrop.dropLocation;
  return (dropLocation[dropLocation.length - 1][0]);
}

/**
 * @return true, if the targeted child group has any children.
 */
function dropLocationHasChildren(dropBlock: BlockDropProperties) {
  if (dropBlock.dropLocation.length > 0) {
    const parentLocation = dropBlock.dropLocation.slice(0, -1);
    const parentCategory = dropLocationChildGroupName(dropBlock);
    const parentNode = dropBlock.codeResource.syntaxTreePeek.locateOrUndefined(parentLocation);
    return (parentNode && parentNode.getChildrenInCategory(parentCategory));
  } else {
    return (true);
  }
}

// Would the immediate child be allowed?
const isLegalDrag = (drag: CurrentDrag, block: BlockDropProperties) => {
  if (!drag || block.dropLocation.length === 0) {
    return false;
  }

  // If any of the described blocks is allowed, we assume the drag is allowed
  return (drag.draggedDescription.some(dragged => {
    try {
      const newNodeType: QualifiedTypeName = {
        languageName: dragged.language,
        typeName: dragged.name
      }
      const currentTree = block.codeResource.syntaxTreePeek;

      // If the tree is empty, the drop is always forbidden.
      // This happens if some block is rendered in the sidebar or as a dragged
      // block and the current tree is empty.
      if (!currentTree.isEmpty) {
        const currentLanguage = block.codeResource.validationLanguagePeek;

        const parentNode = currentTree.locate(block.dropLocation.slice(0, -1));
        const parentNodeType = currentLanguage.getType(parentNode.qualifiedName);

        return (parentNodeType.allowsChildType(newNodeType, dropLocationChildGroupName(block)));
      } else {
        return (false);
      }
    } catch (e) {
      return (false);
      //debugger;
    }
  }));
}

/**
 * Calculates how the given block should react to the given drag.
 */
export function calculateDropTargetState(
  drag: CurrentDrag,
  block: BlockDropProperties
): DropTargetState {
  // Does the description come with a visibility expression? If not assume isEmpty
  let visibilityExpr: VisualBlockDescriptions.VisibilityExpression = { $var: "ifEmpty" };
  if (block.visual && block.visual.dropTarget && block.visual.dropTarget.visibility) {
    visibilityExpr = block.visual.dropTarget.visibility;
  }

  // Would the new tree ba a completly valid tree?
  const isLegalChild = () => {
    if (!drag || block.dropLocation.length === 0) {
      return false;
    }

    const newNode = drag.draggedDescription;
    const oldTree = block.codeResource.syntaxTreePeek;
    const validator = block.codeResource.validationLanguagePeek.validator;

    const newTree = embraceNode(validator, oldTree, block.dropLocation, newNode)
    const result = block.codeResource.emittedLanguagePeek.validateTree(newTree);
    return (result.isValid);
  }

  // Build the value map that corresponds to the state for the current block
  const map: Restricted.VariableMap<VisualBlockDescriptions.VisibilityVars> = {
    ifAnyDrag: !!drag,
    ifEmpty: () => !dropLocationHasChildren(block),
    ifLegalChild: isLegalChild.bind(this),
    ifLegalDrag: isLegalDrag.bind(this, drag, block)
  };

  // Evaluation of the expression function may be costly. So we postpone it until
  // it is actually required.
  const visibilityEvalFunc = evalExpression.bind(this, visibilityExpr, map);

  // Ongoing drags trump almost any other possibility
  if (drag) {
    // Highlight in case something is dragging over us. This can only happen if
    // we have been visible before, so there is no need for any additional checking
    const onThis = arrayEqual(drag.dropLocation, block.dropLocation);

    if (onThis) {
      return ("self");
    } else {
      if (visibilityEvalFunc()) {
        return ("available");
      } else {
        return ("none");
      }
    }
  } else {
    if (visibilityEvalFunc()) {
      return ("visible");
    } else {
      return ("none");
    }
  }
}
