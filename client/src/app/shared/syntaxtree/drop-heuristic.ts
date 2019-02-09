import { NodeLocation, NodeDescription, QualifiedTypeName } from "./syntaxtree.description";
import { Validator } from './validator';
import { Tree, Node } from './syntaxtree';
import { canEmbraceNode } from './embrace';

interface SmartDropLocation {
  location: NodeLocation;
  operation: "embrace" | "drop"
}

/**
 * Determines whether something could be inserted at the given place
 * in the current node.
 */
function allowsInsertion(
  node: Node,
  typeName: QualifiedTypeName,
  categoryName: string,
  index: number,
): boolean {
  return (false);
}

/**
 * Walks up the tree to find a meaningful place to insert any
 * of the given candidates.
 */
function _parentAppendLocation(
  validator: Validator,
  tree: Tree,
  loc: NodeLocation,
  candidates: NodeDescription[]
) {
  // Check each candidate
  candidates.forEach(c => {
    const fillType: QualifiedTypeName = { languageName: c.language, typeName: c.name };

    // At each position
    let curr = tree.locateOrUndefined(loc);
    while (curr) {
      const p = validator.getType(curr.qualifiedName);

      const insert = p.allowedChildrenCategoryNames
        .filter(existingCategory => p.allowsChildType(fillType, existingCategory));

      curr = curr.nodeParent;
    }
  });
}

/**
 * Possibly meaningful approach:
 * 1) Valid embraces take precedence
 * 2) Append after self (if cardinality and immediate type fits)
 * 3) Append after any parent (if cardinality and immediate type fits)
 * 4) No drop
 *
 * Basic rule: Do not build invalid trees according to cardinality. These
 * are errors that can not be fixed.
 *
 * Edge cases that require human intervention:
 * * In an SQL SELECT statement like `SELECT col` a drop of a function like
 *   `COUNT` on `col` could either mean "add this COUNT to the list" or
 *   "COUNT(col)"
 *
 * @param validator The rules that must hold after the embracing
 * @param tree The tree to modify
 * @param loc The location of the node to be embraced
 * @param candidates All nodes that could possibly be used to embrace
 */
function smartDropLocation(
  validator: Validator,
  tree: Tree,
  loc: NodeLocation,
  candidates: NodeDescription[]
): SmartDropLocation | undefined {
  if (canEmbraceNode(validator, tree, loc, candidates)) {
    return ({
      location: loc,
      operation: "embrace"
    });
  } else {

  }
}