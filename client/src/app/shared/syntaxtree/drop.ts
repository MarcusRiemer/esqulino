import { NodeLocation, NodeDescription } from "./syntaxtree.description";
import { Validator } from './validator';
import { Tree } from './syntaxtree';
import { embraceMatches } from './drop-embrace';
import { SmartDropLocation, SmartDropOptions, InsertDropLocation } from './drop.description';
import { insertAtAnyParent } from './drop-parent';
import { _cardinalityAllowsInsertion } from './drop-util';

export const DEFAULT_SMART_DROP_OPTIONS: SmartDropOptions = {
  allowAnyParent: true,
  allowEmbrace: true,
};

/**
 * Attempts to insert all candidates exactly at the given location.
 *
 * @param validator The rules that must hold after the insertion
 * @param tree The tree to modify
 * @param loc The location of the insertion
 * @param candidates All nodes that could possibly be used to insert
 */
export function _exactMatches(
  validator: Validator,
  tree: Tree,
  loc: NodeLocation,
  candidates: NodeDescription[]
): InsertDropLocation[] {
  // Replacing the root is another matter
  if (loc.length > 0) {
    const targetParent = tree.locate(loc.slice(0, -1));
    const targetParentCategory = loc[loc.length - 1][0];
    const targetParentIndex = loc[loc.length - 1][1];
    const validType = validator.getType(targetParent);

    return (
      candidates
        // The candidate must be of a valid type
        .filter(candidate => {
          const candidateType = { languageName: candidate.language, typeName: candidate.name };
          return (validType.allowsChildType(candidateType, targetParentCategory));
        })
        // Insertion may not destroy cardinality rules
        .filter(candidate => {
          return (_cardinalityAllowsInsertion(validator, targetParent, candidate, targetParentCategory, targetParentIndex));
        })
        // Came so far? You may be inserted!
        .map((candidate): InsertDropLocation => {
          return ({
            operation: "insert",
            location: loc,
            nodeDescription: candidate
          });
        })
    );
  } else {
    return ([]);
  }
}

/**
 * Possibly meaningful approach:
 * 1) Valid embraces
 * 2) Append after self (if cardinality and immediate type fits)
 * 3) Append after any parent (if cardinality and immediate type fits)
 *
 * Basic rule: Do not build invalid trees according to cardinality. These
 * are errors that can not be fixed.
 *
 * Edge cases that require human intervention:
 * * In an SQL SELECT statement like `SELECT col` a drop of a function like
 *   `COUNT` on `col` could either mean "add this COUNT to the list" or
 *   "COUNT(col)"
 *
 * @param validator The rules that must hold after the drop has been placed
 * @param tree The tree to modify
 * @param loc The location of the insertion
 * @param candidates All nodes that could possibly be used to embrace or insert
 */
export function smartDropLocation(
  options: SmartDropOptions,
  validator: Validator,
  tree: Tree,
  loc: NodeLocation,
  candidates: NodeDescription[]
): SmartDropLocation[] {
  // All advanced heuristics only make sense if there is a tree
  if (tree) {
    const toReturn: SmartDropLocation[] = [];

    if (options.allowExact) {

    }

    // Possibly all embracing options
    if (options.allowEmbrace) {
      toReturn.push(...embraceMatches(validator, tree, loc, candidates));
    }

    // Possibly all insertion options
    if (options.allowAnyParent) {
      toReturn.push(...insertAtAnyParent(validator, tree, loc, candidates));
    }

    return (toReturn);
  } else {
    // No tree? Then there is only a single possibility.
    return ([
      { operation: "insert", location: [], nodeDescription: candidates[0] }
    ]);
  }
}
