import { Node, NodeLocation, Tree } from '../../../shared/syntaxtree';
import { VisualBlockDescriptions } from '../../../shared/block';

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
    // No drop information available? Default to inserting after the given
    // node. This should be a meaningful default ...
    if (!drop) {
      drop = {
        self: {
          order: "insertAfter",
          skipParents: 0
        }
      }
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

      // Calculate the index at which to insert
      const lastNodeLocationStep = nodeLocation[lastLevel];
      const adjustedLastLocationStep: NodeLocation = [
        [lastNodeLocationStep[0], lastNodeLocationStep[1] + lastIndexOffset()]
      ];

      // And stick together the new location. The last step is always replaced
      // with the step containing the modified index.
      return (nodeLocation.slice(0, lastLevel).concat(adjustedLastLocationStep));
    }
    // There are no other drop options
    else {
      throw new Error(`Unknown drop description: ` + JSON.stringify(drop));
    }
  }
}
