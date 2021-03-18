import {
  QualifiedTypeName,
  NodeLocation,
  Validator,
  SyntaxTree,
} from "../../../shared/syntaxtree";
import { embraceNode } from "../../../shared/syntaxtree/drop-embrace";
import { _cardinalityAllowsInsertion } from "../../../shared/syntaxtree/drop-util";
import { VisualBlockDescriptions } from "../../../shared/block";
import { Restricted } from "../../../shared/block/bool-mini-expression.description";
import { evalExpression } from "../../../shared/block/bool-mini-expression";
import { arrayEqual } from "../../../shared/util";

import { CurrentDrag } from "../../drag.service";

export type DragTargetState =
  | "unknown"
  | "validTarget"
  | "invalidTarget"
  | "targeted";

/**
 * @return The name of the referenced child group (if there is any)
 */
function dropLocationChildGroupName(loc: NodeLocation): string {
  return loc[loc.length - 1][0];
}

/**
 * @return true, if the targeted child group has any children.
 */
export function dropLocationHasChildren(tree: SyntaxTree, loc: NodeLocation) {
  if (loc.length > 0) {
    const dropLocation = loc.slice(0, -1);
    const dropCategory = dropLocationChildGroupName(loc);
    const dropNode = tree.locateOrUndefined(dropLocation);
    return dropNode && dropNode.getChildrenInCategory(dropCategory).length > 0;
  } else {
    return true;
  }
}

/**
 *
 */
const isLegalImmediateChild = (
  drag: CurrentDrag,
  validator: Validator,
  tree: SyntaxTree,
  loc: NodeLocation
) => {
  if (!drag || loc.length === 0) {
    return false;
  }

  // If any of the described blocks is allowed, we assume the drag is allowed
  return drag.draggedDescription.some((dragged) => {
    try {
      const newNodeType: QualifiedTypeName = {
        languageName: dragged.language,
        typeName: dragged.name,
      };

      // If the tree is empty, the drop is always forbidden.
      // This happens if some block is rendered in the sidebar or as a dragged
      // block and the current tree is empty.
      if (!tree.isEmpty) {
        const parentNode = tree.locate(loc.slice(0, -1));
        const parentNodeType = validator.getType(parentNode.qualifiedName);
        const [category, index] = loc[loc.length - 1];

        return (
          parentNodeType.allowsChildType(
            newNodeType,
            dropLocationChildGroupName(loc)
          ) &&
          _cardinalityAllowsInsertion(
            validator,
            parentNode,
            dragged,
            category,
            index
          )
        );
      } else {
        return false;
      }
    } catch (e) {
      return false;
      //debugger;
    }
  });
};

/**
 * @return True, if the given location generally requires children.
 */
export const _isChildRequiredSchema = (
  validator: Validator,
  tree: SyntaxTree,
  dropLocation: NodeLocation
) => {
  // Only empty trees want insertions at the root
  if (dropLocation.length === 0) {
    return tree.isEmpty;
  }

  const parentLoc = dropLocation.slice(0, -1);
  const parentNode = tree.locateOrUndefined(parentLoc);
  if (!parentNode) {
    return false;
  }

  const category = dropLocationChildGroupName(dropLocation);
  const parentType = validator.getType(parentNode);
  const cardinality = parentType.validCardinality(category);

  return (
    cardinality.minOccurs > parentNode.getChildrenInCategory(category).length
  );
};

function _buildExpression(
  drag: CurrentDrag,
  dropLocation: NodeLocation,
  validator: Validator,
  tree: SyntaxTree,
  visibilityExpr: VisualBlockDescriptions.VisibilityExpression
): () => boolean {
  // Would the new tree ba a completly valid tree?
  const isLegalSubtree = () => {
    if (!drag || dropLocation.length === 0) {
      return false;
    }

    const newNode = drag.draggedDescription;

    const newTree = embraceNode(validator, tree, dropLocation, newNode);
    const result = validator.validateFromRoot(newTree);
    return result.isValid;
  };

  // Build the value map that corresponds to the state for the current block
  const map: Restricted.VariableMap<VisualBlockDescriptions.VisibilityVars> = {
    ifAnyDrag: !!drag,
    ifEmpty: () => !dropLocationHasChildren(tree, dropLocation),
    ifLegalChild: isLegalSubtree.bind(this),
    ifLegalDrag: isLegalImmediateChild.bind(
      this,
      drag,
      validator,
      tree,
      dropLocation
    ),
    ifChildrenRequired: _isChildRequiredSchema.bind(
      this,
      validator,
      tree,
      dropLocation
    ),
  };

  // Evaluation of the expression function may be costly. So we postpone it until
  // it is actually required.
  const visibilityEvalFunc = evalExpression.bind(this, visibilityExpr, map);

  return visibilityEvalFunc;
}

/**
 * Calculates what the given drop location "thinks" about the given
 * drag operation.
 */
export function targetState(
  drag: CurrentDrag,
  dropLocation: NodeLocation,
  validator: Validator,
  tree: SyntaxTree
): DragTargetState {
  // Does the description come with a visibility expression? If not assume isEmpty
  let visibilityExpr: VisualBlockDescriptions.VisibilityExpression = {
    $var: "ifLegalDrag",
  };

  // Build the value map that corresponds to the state for the current block
  const stateFunc = _buildExpression(
    drag,
    dropLocation,
    validator,
    tree,
    visibilityExpr
  );

  // Ongoing drags trump almost any other possibility
  if (drag) {
    // Highlight in case something is dragging over us. This can only happen if
    // we have been visible before, so there is no need for any additional checking
    const onThis = arrayEqual(drag.dropLocation, dropLocation);

    if (onThis) {
      return "targeted";
    } else {
      if (stateFunc()) {
        return "validTarget";
      } else {
        return "invalidTarget";
      }
    }
  } else {
    return "unknown";
  }
}
