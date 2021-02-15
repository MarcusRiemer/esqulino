import { _cardinalityAllowsInsertion } from "./drop-util";
import { InsertDropLocation } from "./drop.description";
import {
  NodeDescription,
  NodeLocation,
  QualifiedTypeName,
  Tree,
} from "./syntaxtree";
import { Validator } from "./validator";

export function insertAsChild(
  validator: Validator,
  tree: Tree,
  loc: NodeLocation,
  candidates: NodeDescription[]
): InsertDropLocation[] {
  const parentingNode = tree.locateOrUndefined(loc);

  if (parentingNode) {
    const toReturn: ReturnType<typeof insertAsChild> = [];
    const parentingNodeValidator = validator.getType(
      parentingNode.qualifiedName
    );

    // Check each candidate that could be appended somewhere ...
    candidates.forEach((candidate) => {
      const fillType: QualifiedTypeName = {
        languageName: candidate.language,
        typeName: candidate.name,
      };

      const insertionCategories = parentingNodeValidator.allowedChildrenCategoryNames.filter(
        (existingCategory) =>
          parentingNodeValidator.allowsChildType(fillType, existingCategory)
      );

      insertionCategories.forEach((c) => {
        if (
          _cardinalityAllowsInsertion(validator, parentingNode, candidate, c, 0)
        ) {
          // TODO: Proper insert location
        }
      });
    });

    return toReturn;
  } else {
    return [];
  }
}
