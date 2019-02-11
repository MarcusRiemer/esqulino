import { Node, NodeLocation, QualifiedTypeName, embraceNode } from '../../../shared/syntaxtree';
import { VisualBlockDescriptions } from '../../../shared/block';
import { Restricted } from '../../../shared/block/bool-mini-expression.description'
import { evalExpression } from '../../../shared/block/bool-mini-expression'
import { arrayEqual } from '../../../shared/util';

import { CurrentDrag } from '../../drag.service';

import { BlockDropProperties } from './block-drop-properties';

// Alias to shorten some typing
type DropTargetProperties = VisualBlockDescriptions.DropTargetProperties;

/**
 * @return True, if the given drop target drops on a parent
 */
function isParentDrop(dropTarget: DropTargetProperties) {
  return (dropTarget && dropTarget.parent);
}

/**
 * @return True, if the given drop target drops on children
 */
function isChildDrop(dropTarget: DropTargetProperties) {
  return (dropTarget && dropTarget.children);
}

/**
 * @return True, if the given drop target drops on itself
 */
function isSelfDrop(dropTarget: DropTargetProperties) {
  return (dropTarget && dropTarget.self);
}

/**
 * Calculates the exact drop location based on the node and the drop
 * instructions.
 */
export function calculateDropLocation(node: Node, drop: DropTargetProperties): NodeLocation | undefined {
  if (!node) {
    return;
  } else {
    // No drop information available? Go for the standard
    if (!drop) {
      drop = VisualBlockDescriptions.DefaultDropTargetProperties;
    }

    // Are we dropping at the parent?
    const parentDrop = isParentDrop(drop);
    if (parentDrop) {
      const calculateCategoryIndex = () => {
        switch (parentDrop.order) {
          case "insertFirst": return (0);
          case "insertLast": return (node.nodeParent.getChildrenInCategory(parentDrop.category).length);
        }
      };

      const index = calculateCategoryIndex();
      return (node.location.slice(0, -1).concat([[parentDrop.category, index]]));
    }

    // Are we dropping at the children?
    const childDrop = isChildDrop(drop);
    if (childDrop) {
      const calculateCategoryIndex = () => {
        switch (childDrop.order) {
          case "insertFirst": return (0);
          case "insertLast": return (node.getChildrenInCategory(childDrop.category).length);
        }
      };

      const index = calculateCategoryIndex();
      return (node.location.concat([[childDrop.category, index]]));
    }

    // Or are we dropping on the node itself?
    const selfDrop = isSelfDrop(drop);
    if (selfDrop) {
      const lastIndexOffset = () => {
        switch (selfDrop.order) {
          case "insertAfter": return (+1);
          case "insertBefore": return (0);
        }
      }

      const nodeLocation = node.location;

      // Possibly skip some parents
      const lastLevel = nodeLocation.length - selfDrop.skipParents - 1;

      // Skipping too much? Thats the root
      if (lastLevel < 0) {
        return ([]);
      } else {
        // Calculate the index at which to insert
        const lastNodeLocationStep = nodeLocation[lastLevel];
        const adjustedLastLocationStep: NodeLocation = [
          [lastNodeLocationStep[0], lastNodeLocationStep[1] + lastIndexOffset()]
        ];

        // And stick together the new location. The last step is always replaced
        // with the step containing the modified index.
        return (nodeLocation.slice(0, lastLevel).concat(adjustedLastLocationStep));
      }
    }
    // There are no other drop options
    else {
      throw new Error(`Unknown drop description: ` + JSON.stringify(drop));
    }
  }
}

/**
 * These states control how a drop target should react to a drag
 * operation. "none" means the location wouldn't be valid, "self"
 * if the operation is currently over the target itself and
 * "available" signals ... well ... availability to the drag.
 */
export type DropTargetState = "none" | "self" | "visible" | "available"

/**
 * @return True, if this drop will be made into a strictly defined category.
 */
function isParentOrChildDrop(block: BlockDropProperties) {
  const dropTarget = block.visual && block.visual.dropTarget;
  return (dropTarget.children || dropTarget.parent);
}

/**
 * @return The name of the referenced child group (if there is any)
 */
function dropLocationChildGroupName(block: BlockDropProperties): string {
  const dropLocation = calculateDropLocation(block.node, block.visual.dropTarget);
  return (dropLocation[dropLocation.length - 1][0]);
}

/**
 * @return true, if the targeted child group has any children.
 */
function dropLocationHasChildren(blockDropProperties: BlockDropProperties) {
  if (isParentOrChildDrop(blockDropProperties)) {
    // Count children in that category
    const childGroupName = dropLocationChildGroupName(blockDropProperties);
    return (blockDropProperties.node.getChildrenInCategory(childGroupName).length > 0);
  } else {
    // At least the given node is in the category
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
      return (true);
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
  // Does the description come with a visibility expression? If not simply assume false
  let visibilityExpr: VisualBlockDescriptions.VisibilityExpression = { $value: false };
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

  const isEmbraceDrop = drag && drag.isEmbraceDrop;

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
