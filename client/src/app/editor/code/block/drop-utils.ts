import { Node, NodeLocation, Tree, QualifiedTypeName } from '../../../shared/syntaxtree';
import { VisualBlockDescriptions } from '../../../shared/block';
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
        console.log("Dug too deep while dropping");
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
function dropLocationChildGroupName(drag: CurrentDrag, block: BlockDropProperties): string {
  const dropLocation = calculateDropLocation(block.node, block.visual.dropTarget);
  return (dropLocation[dropLocation.length - 1][0]);
}

/**
 * @return true, if the targeted child group has any children.
 */
function dropLocationHasChildren(drag: CurrentDrag, block: BlockDropProperties) {
  const childGroupName = dropLocationChildGroupName(drag, block);
  if (isParentOrChildDrop(block)) {
    // Count children in that category
    return (block.node.getChildrenInCategory(childGroupName).length > 0);
  } else {
    // At least the given node is in the category
    return (true);
  }
}

/**
 * Calculates how the given block should react to the given drag.
 */
export function calculateDropTargetState(drag: CurrentDrag, block: BlockDropProperties): DropTargetState {
  let flags = [];
  if (block.visual && block.visual.dropTarget && block.visual.dropTarget.visibility) {
    flags = block.visual.dropTarget.visibility;
  }

  // Ongoing drags trump almost any other possibility
  if (drag) {
    // Highlight in case something is dragging over us. This can only happen if
    // we have been visible before, so there is no need for any additional checking
    const onThis = arrayEqual(drag.hoverPlaceholder, block.dropLocation);
    if (onThis) {
      return ("self");
    } else {
      // Some flags indicate that they want to show this placeholder if a drag is going on
      if (flags.some(f => f === "ifAnyDrag")) {
        return ("available");
      } else if (flags.some(f => f === "ifLegalDrag")) {
        // Would the new tree ba a valid tree?
        const newNode = drag.draggedDescription;
        const oldTree = block.codeResource.syntaxTreePeek;
        const newTree = oldTree.insertNode(block.dropLocation, newNode);

        const result = block.codeResource.programmingLanguagePeek.validateTree(newTree);
        if (result.isValid) {
          return ("available");
        } else {
          return ("none");
        }
      } else if (flags.some(f => f === "ifLegalChild")) {
        // Would the immediate child be allowed?
        const newNodeType: QualifiedTypeName = {
          languageName: drag.draggedDescription.language,
          typeName: drag.draggedDescription.name
        }
        const currentTree = block.codeResource.syntaxTreePeek;
        const currentLanguage = block.codeResource.programmingLanguagePeek;

        const parentNode = currentTree.locate(block.dropLocation.slice(0, -1));
        const parentNodeType = currentLanguage.getType(parentNode.qualifiedName);

        if (parentNodeType.allowsChildType(newNodeType, dropLocationChildGroupName(drag, block))) {
          return ("available");
        } else {
          return ("none");
        }
      } else {
        return ("none");
      }
    }
  } else {
    // There is no drag, but some placeholders want to be visible anyway
    if (flags.some(f => f === "always")) {
      return ("visible");
    }
    if (flags.some(f => f === "ifEmpty") && !dropLocationHasChildren(drag, block)) {
      return ("visible");
    } else {
      return ("none");
    }
  }
}
