import { NodeLocation, NodeDescription } from "./syntaxtree.description";
import { Validator } from "./validator";
import { Tree } from "./syntaxtree";
import { embraceMatches } from "./drop-embrace";
import {
  SmartDropLocation,
  SmartDropOptions,
  InsertDropLocation,
  ReplaceDropLocation,
  SmartDropAlgorithmNames,
} from "./drop.description";
import { insertAtAnyParent, appendAtParent } from "./drop-parent";
import { _cardinalityAllowsInsertion } from "./drop-util";
import { ErrorCodes } from "./validation-result";

export const DEFAULT_SMART_DROP_OPTIONS: SmartDropOptions = {
  allowAnyParent: true,
  allowEmbrace: true,
};

// These errors signal errors that would be triggered by using an illegal
// node as the root.
const ROOT_ERRORS: string[] = [
  ErrorCodes.UnknownRoot,
  ErrorCodes.UnknownRootLanguage,
  ErrorCodes.UnexpectedType,
];

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
): (InsertDropLocation | ReplaceDropLocation)[] {
  // Replacing the root (or anything in an empty tree) is another matter
  if (loc.length > 0 && tree && !tree.isEmpty) {
    const targetParent = tree.locate(loc.slice(0, -1));
    const targetParentCategory = loc[loc.length - 1][0];
    const targetParentIndex = loc[loc.length - 1][1];
    const validType = validator.getType(targetParent);

    return (
      candidates
        // The candidate must be of a valid type
        .filter((candidate) => {
          const candidateType = {
            languageName: candidate.language,
            typeName: candidate.name,
          };
          return validType.allowsChildType(candidateType, targetParentCategory);
        })
        // Insertion may not destroy cardinality rules
        .filter((candidate) => {
          return _cardinalityAllowsInsertion(
            validator,
            targetParent,
            candidate,
            targetParentCategory,
            targetParentIndex
          );
        })
        // Came so far? You may be inserted!
        .map((candidate): InsertDropLocation | ReplaceDropLocation => {
          return {
            operation: "insert",
            algorithm: "allowExact",
            location: loc,
            nodeDescription: candidate,
          };
        })
    );
  }
  // Replacing the root is handled here
  else if (loc.length === 0 && (!tree || tree.isEmpty)) {
    return candidates
      .filter((candidate) => {
        // Build a tree and see whether any of the candidates is "cardinality-valid" on its own.
        const possibleTree = new Tree(candidate);
        if (possibleTree.isEmpty) {
          return false;
        }

        const valResult = validator.validateFromRoot(possibleTree);
        const rootNode = possibleTree.locate([]);
        const rootErrors = valResult.getErrorsOn(rootNode);
        return rootErrors.every((err) => !ROOT_ERRORS.includes(err.code));
      })
      .map(
        (candidate): ReplaceDropLocation => {
          // It fits? Then we allow the insertion
          return {
            operation: "replace",
            algorithm: "allowExact",
            location: [],
            nodeDescription: candidate,
          };
        }
      );
  }
  // Sometimes there is nothing that could be proposed
  else {
    return [];
  }
}

/**
 * Issues a "replace" action if the target location is a hole that
 * does not
 *
 * @param validator The rules that must hold after the insertion
 * @param tree The tree to modify
 * @param loc The location of the insertion
 * @param candidates All nodes that could possibly be used to insert
 */
export function _singleChildReplace(
  validator: Validator,
  tree: Tree,
  loc: NodeLocation,
  candidates: NodeDescription[]
): ReplaceDropLocation[] {
  // We don't deal with replacing the root here
  if (loc.length > 0) {
    const targetParent = tree.locateOrUndefined(loc.slice(0, -1));

    // The target must exist
    if (targetParent) {
      const targetParentCategory = loc[loc.length - 1][0];
      const validType = validator.getType(targetParent);
      const validCardinality = validType.validCardinality(targetParentCategory);
      const isHole =
        validCardinality.minOccurs === 1 && validCardinality.maxOccurs === 1;
      const isFilled =
        targetParent.getChildrenInCategory(targetParentCategory).length === 1;

      if (isHole && isFilled) {
        return (
          candidates
            // The candidate must be of a valid type
            .filter((candidate) => {
              const candidateType = {
                languageName: candidate.language,
                typeName: candidate.name,
              };
              return validType.allowsChildType(
                candidateType,
                targetParentCategory
              );
            })
            .map(
              (candidate): ReplaceDropLocation => {
                return {
                  operation: "replace",
                  algorithm: "allowReplace",
                  location: loc,
                  nodeDescription: candidate,
                };
              }
            )
        );
      }
    }
  }

  // We are either at the root or did not have a hole
  return [];
}

// The signature of an algorithm that may compute smart drops
type SmartDropAlgorithm = (
  validator: Validator,
  tree: Tree,
  loc: NodeLocation,
  candidates: NodeDescription[]
) => SmartDropLocation[];

// The algorithms that are actually available
const algorithms: { [name in SmartDropAlgorithmNames]: SmartDropAlgorithm } = {
  allowExact: _exactMatches,
  allowEmbrace: embraceMatches,
  allowReplace: _singleChildReplace,
  allowAppend: appendAtParent,
  allowAnyParent: insertAtAnyParent,
  root: undefined,
};

/**
 * Possibly meaningful approach:
 *
 * 0) If applicable: Take the exact match and try to make it happen.
 * 1) Valid embraces
 * 2) Append after self (if cardinality and immediate type fits)
 * 3) Append after any parent (if cardinality and immediate type fits)
 *
 * TODO: This order should probably be flexible
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
  const toReturn: SmartDropLocation[] = [];
  const matches = new Set<SmartDropAlgorithmNames>();

  // Runs the given algorith,
  const runAlgorithm = (name: SmartDropAlgorithmNames) => {
    const dropAlternatives = algorithms[name](validator, tree, loc, candidates);
    if (dropAlternatives.length > 0) {
      toReturn.push(...dropAlternatives);
      matches.add(name);
    }
  };

  // All advanced heuristics only make sense if there is a tree
  if (tree) {
    // Possibly add the exact location that was requested.
    if (options.allowExact) {
      runAlgorithm("allowExact");
    }

    // Possibly all embracing options
    if (options.allowEmbrace) {
      runAlgorithm("allowEmbrace");
    }

    // Possibly all replacement options
    if (options.allowReplace) {
      runAlgorithm("allowReplace");
    }

    // Possibly appending
    if (options.allowAppend) {
      runAlgorithm("allowAppend");
    }

    // Possibly all insertion options
    if (options.allowAnyParent) {
      runAlgorithm("allowAnyParent");
    }

    return toReturn;
  } else {
    // No tree? Then there is only a single possibility.
    return [
      {
        operation: "insert",
        algorithm: "root",
        location: [],
        nodeDescription: candidates[0],
      },
    ];
  }
}
