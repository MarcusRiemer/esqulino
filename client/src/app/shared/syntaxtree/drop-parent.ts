import {
  NodeLocation,
  NodeDescription,
  QualifiedTypeName,
} from "./syntaxtree.description";
import { Validator } from "./validator";
import { SyntaxTree } from "./syntaxtree";
import { InsertDropLocation } from "./drop.description";
import { _cardinalityAllowsInsertion } from "./drop-util";

/**
 * Walks up the tree to find valid places in any of the existing
 * child categories to insert any of the given candidates.
 *
 * @param validator The rules that must hold after the embracing
 * @param tree The tree to modify
 * @param loc The location of the node to be inserted
 * @param candidates All nodes that could possibly be used to embrace
 */
export function insertAtAnyParent(
  validator: Validator,
  tree: SyntaxTree,
  loc: NodeLocation,
  candidates: NodeDescription[]
): InsertDropLocation[] {
  const toReturn: InsertDropLocation[] = [];

  // Check each candidate that could be appended somewhere ...
  candidates.forEach((candidate) => {
    const fillType: QualifiedTypeName = {
      languageName: candidate.language,
      typeName: candidate.name,
    };
    let stepsUp = 0; // Number of steps made towards the root

    // ... against each node up to the root
    let currNode = tree.locateOrUndefined(loc);

    // If the searched node does not exist immediatly, we are probably asked to insert
    // something in a location that does not yet exist. In that case we simply
    // assume that we may take *any* parent of the given location and start the search
    // from there.
    while (!currNode && loc.length > stepsUp) {
      currNode = tree.locateOrUndefined(loc.slice(0, -(stepsUp + 1)));
      stepsUp++;
    }

    // A similar game as before: We ultimately want to walk up the tree. But this time
    // we have actual nodes so we may check each of these locations.
    while (currNode) {
      // Find out which categories could be theoretically used for
      // the given type
      const nodeValidator = validator.getType(currNode.qualifiedName);
      const insertionCategories =
        nodeValidator.allowedChildrenCategoryNames.filter((existingCategory) =>
          nodeValidator.allowsChildType(fillType, existingCategory)
        );

      // Find out which location indices could be used for the given type
      insertionCategories.forEach((categoryName) => {
        const theoreticalIndices =
          currNode.getChildrenInCategory(categoryName).length;

        // <= because insertions may also occur *after* an existing element
        for (let i = 0; i <= theoreticalIndices; ++i) {
          if (
            _cardinalityAllowsInsertion(
              validator,
              currNode,
              candidate,
              categoryName,
              i
            )
          ) {
            // Slicing needs to be omitted of stepsUp is 0, because [1,2,3].slice(0, 0)
            // returns an empty array.
            const pathBefore = stepsUp !== 0 ? loc.slice(0, -stepsUp) : loc;
            toReturn.push({
              location: [...pathBefore, [categoryName, i]],
              operation: "insert",
              algorithm: "allowAnyParent",
              nodeDescription: candidate,
            });
          }
        }
      });

      // Go one node up the chain
      currNode = currNode.nodeParent;
      stepsUp++;
    }
  });

  return toReturn;
}

/**
 * Attempts to insert the given candidates right after the given
 * location.
 *
 * @param validator The rules that must hold after the embracing
 * @param tree The tree to modify
 * @param loc The location of the node to be inserted
 * @param candidates All nodes that could possibly be used to embrace
 */
export function appendAtParent(
  validator: Validator,
  tree: SyntaxTree,
  loc: NodeLocation,
  candidates: NodeDescription[]
): InsertDropLocation[] {
  let parentPath = loc.slice(0, -1);
  let parentNode = tree.locateOrUndefined(parentPath);

  // We can't append anything if there is no parent or if the node
  // to append after does not exist
  if (loc.length > 0 && parentNode && tree.locateOrUndefined(loc)) {
    // Appending happens after the location that was given.
    const childLocation = loc[loc.length - 1];
    let [cat, index] = childLocation;
    index++;

    const nodeValidator = validator.getType(parentNode.qualifiedName);

    return (
      candidates
        // Type must be allowed in general
        .filter((c) =>
          nodeValidator.allowsChildType(
            { languageName: c.language, typeName: c.name },
            cat
          )
        )
        // Cardinality may not be violated
        .filter((c) =>
          _cardinalityAllowsInsertion(validator, parentNode, c, cat, index)
        )
        .map((c): InsertDropLocation => {
          return {
            operation: "insert",
            algorithm: "allowAnyParent",
            location: [...parentPath, [cat, index]],
            nodeDescription: c,
          };
        })
    );
  } else {
    return [];
  }
}
