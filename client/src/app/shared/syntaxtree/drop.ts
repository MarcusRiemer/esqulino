import { NodeLocation, NodeDescription } from "./syntaxtree.description";
import { Validator } from './validator';
import { Tree } from './syntaxtree';
import { _findMatchInCandidate, embraceMatches } from './drop-embrace';
import { SmartDropLocation } from './drop.description';

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
 * @param validator The rules that must hold after the embracing
 * @param tree The tree to modify
 * @param loc The location of the node to be embraced
 * @param candidates All nodes that could possibly be used to embrace
 */
export function smartDropLocation(
  validator: Validator,
  tree: Tree,
  loc: NodeLocation,
  candidates: NodeDescription[]
): SmartDropLocation[] {
  const toReturn: SmartDropLocation[] = [];

  // Is embracing an option?
  toReturn.push(...embraceMatches(validator, tree, loc, candidates));

  // Is appending to any of the parents an option?

  return (toReturn);
}
