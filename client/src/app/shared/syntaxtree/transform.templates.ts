import { NodeDescription } from "./syntaxtree.description";
import * as T from "./transform.description";
/* Defining the Patterns and their respective transformations for the regex cases*/

/* Specific Selectors for the regex tescases */
export const SelectorNestedInvisNodes: T.SelectorImmediateChild = {
  kind: "immediateChild",
  parent: {
    kind: "type",
    name: "invis-container",
  },
  child: {
    kind: "type",
    name: "invis-container",
  },
};

// TODO: Alternation Selectors

export const SelectorRegexChar: T.Selector = {
  kind: "type",
  language: "regex",
  name: "char",
};

export const SelectorRegexString: T.Selector = {
  kind: "type",
  language: "regex",
  name: "string",
};

export const SelectorLongProperty: T.Selector = {
  kind: "property",
  name: "value",
  propertyValueMinLength: 2,
};

export const SelectorMultiValuedChars: T.Selector = {
  kind: "all",
  selectors: [SelectorRegexChar, SelectorLongProperty],
};

export const TransformPatternSplitMultiValuedChar: T.TransformPatternSplitOnProperty =
  {
    kind: "split-prop",
    newNode: "copy-type",
    wraperNode: { language: "regex", name: "invis-container" },
    propertyName: "value",
    delimiter: "", // The delimiter to split the string value of the property on. When not defined, the "" is assumed, which splits a string on a per character basis
    otherProperties: "ignore",
    oldChildren: "ignore",
  };

export const TemplateMultivaluedChar = {
  pattern: {
    node: SelectorMultiValuedChars,
  },
  transform: {
    transformPattern: TransformPatternSplitMultiValuedChar,
    onto: "node",
  },
};

/* The Matching should be the result of matching a selector against the given 
tree and it should probably have a reference to the parent node as well, 
just to make transformations such as unwrap and replace easier to implement. */
