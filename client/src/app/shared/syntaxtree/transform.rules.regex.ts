import { NodeDescription } from "./syntaxtree.description";
import * as T from "./transform.description";
import {
  TransformPatternWrapWith,
  TransformPattern,
} from "./transform.description";
/* Defining the Patterns and their respective transformations for the regex cases*/

const LANGUAGE = "regex";

/* Specific Selectors for the regex tescases */

const SelectorRoot: T.Selector = {
  kind: "root",
};

const SelectorNotInvisContainer: T.Selector = {
  kind: "type",
  language: LANGUAGE,
  notName: "invis-container",
};

const SelectorInvisContainer: T.Selector = {
  kind: "type",
  name: "invis-container",
};

const SelectorRegexChar: T.Selector = {
  kind: "type",
  language: LANGUAGE,
  name: "char",
};

const SelectorRegexString: T.Selector = {
  kind: "type",
  language: LANGUAGE,
  name: "string",
};

const SelectorAlternation: T.Selector = {
  kind: "type",
  language: LANGUAGE,
  name: "alternation",
};

const SelectorLongProperty: T.Selector = {
  kind: "property-simple",
  name: "value",
  propertyValueMinLength: 2,
};

const SelectorMultiValuedChars: T.Selector = {
  kind: "all",
  selectors: [SelectorRegexChar, SelectorLongProperty],
};

const SelectorNonInvisContainerRoot: T.Selector = {
  kind: "all",
  selectors: [SelectorRoot, SelectorNotInvisContainer],
};

const SelectorNestedInvisNodes: T.SelectorImmediateChild = {
  kind: "immediateChild",
  parent: SelectorInvisContainer,
  child: SelectorInvisContainer,
};

const SelectorNestedAlternation: T.SelectorImmediateChild = {
  kind: "immediateChild",
  parent: SelectorAlternation,
  child: SelectorAlternation,
};

/* ------- Transformation Patterns ---------  */

const TransformPatternSplitMultiValuedChar: T.TransformPatternSplitOnProperty =
  {
    kind: "split-property",
    newNodes: "copy-type",
    wraperNode: { language: LANGUAGE, name: "invis-container" },
    propertyName: "value",
    delimiter: "", // The delimiter to split the string value of the property on. When not defined, the "" is assumed, which splits a string on a per character basis
    otherProperties: "ignore",
    oldChildren: "ignore",
  };

const TransformPatternAutoWrapRootWithInvisContainer: T.TransformPatternWrapWith =
  {
    kind: "wrap",
    newNode: { name: "invis-container", language: LANGUAGE },
    oldChildrenCopyOntoGroup: "elements",
  };

const TransformPatternUnwrapNestedContainers: T.TransformPatternUnwrap = {
  kind: "unwrap",
  position: "in-place",
  oldProperties: "ignore",
};

const TransformPatternMergeTwoWithBothChildrenIgnoringProps: T.TransformPattern =
  {
    kind: "merge",
    oldChildren: "copy-both",
    oldProperties: "ignore",
  };

/* Defining the transformation rules for the regex case */

export const regexTranformRules: T.TransformRule[] = [
  /** RULE 1: Char nodes should be single valued.
   * Multivalued character nodes should be split into multiple single-valued
   * character nodes wrapped inside an invis-container.
   * */
  {
    selector: SelectorMultiValuedChars,
    transformPattern: TransformPatternSplitMultiValuedChar,
  },
  /** RULE 2: The root nodes should always be an invis-container node.
   * Any root node that is not an invis-container node should be replaced with
   * the same node wrapped with an invis-container.
   * */
  {
    selector: SelectorNonInvisContainerRoot,
    transformPattern: TransformPatternAutoWrapRootWithInvisContainer,
  },
  /** RULE 3: Unwrapping of nested invis-container nodes.
   * Any invis-container node that appears as a child of an invis-container
   * node should be removed. It's children should then become children of the
   * parent invis-container node, placed under the "elements" childGroup.
   */
  {
    selector: SelectorNestedInvisNodes,
    transformPattern: TransformPatternUnwrapNestedContainers,
  },
  /** RULE 4: Mering of immediate sibling invis-container nodes
   * If two invis-container node  appears on the same level as adjacent
   * sibling nodes, they must be merged into a new invis-container node that
   * contains all their children as children.
   */
  {
    selector: SelectorInvisContainer,
    transformPattern: TransformPatternMergeTwoWithBothChildrenIgnoringProps,
  },
  /** RULE 5: Unwrapping nested alternations.
   * If an alternation node appears a child of another alternation
   * node, the child node should be removed. It's children should then become children of the
   * parent invis-container node, placed under the "elements" childGroup.
   */
  {
    selector: SelectorNestedAlternation,
    transformPattern: TransformPatternUnwrapNestedContainers,
  },
];

export const RegexFormatingRules: T.TransformRule[] = [];
