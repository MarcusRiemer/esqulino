import { NodeDescription } from "./syntaxtree.description";

/* General Selectors */

export type SelectorType = {
  kind: "type"; // "type" here refers to the nodeType that the selector is targeting.
  language?: string;
  name?: string; // Making the name optional allows for the any selector, when no name is defined.
};

export type SelectorRoot = {
  kind: "root";
};

/* Combined Selectors */
export type SelectorImmediateChild = {
  kind: "immediateChild";
  parent: Selector;
  child: Selector;
};

/* This might be needed for the merge tansformation, 
but not sure if I need to have it as sibling or originating from the parent.*/
/*
export type SelectorNextSiblingOfType = {
  kind: "nextSiblingOfType",
  sibling: Selector,
} */

export type SelectorAll = {
  kind: "all";
  selectors: Selector[];
};

export type SelectorAny = {
  kind: "any";
  selectors: Selector[];
};

export type SelectorProperty = {
  kind: "property";
  name: string;
  propertyContainsValue?: string; // TODO: Might be better to support regex expressions here instead of string, to check whether a property contains some value.
  propertyValueMinLength?: number; //TODO: Maybe redundant? Not sure if needed in the general case.
};

/*
const exampleAllSelector = {
   kind: "all",
   selectors: [
     { kind: "type", language: "regex" },
     { kind: "property", name: "char", propertyContainsValue: "a" }
   ]
 }
 
*/

export type Selector =
  | SelectorType
  | SelectorRoot
  | SelectorImmediateChild
  | SelectorAll
  | SelectorAny
  | SelectorProperty;

/* Specific Selectors for the regex tescases */
const SelectorNestedInvisNodes: SelectorImmediateChild = {
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

const SelectorRegexChar: Selector = {
  kind: "type",
  language: "regex",
  name: "char",
};

const SelectorLongProperty: Selector = {
  kind: "property",
  name: "value",
  propertyValueMinLength: 2,
};

export const SelectorMultiValuedChars: Selector = {
  kind: "all",
  selectors: [SelectorRegexChar, SelectorLongProperty],
};

// TODO: Alternation Selectors

/* TODO: Is this selector really needed? Why not just match against language? 

export type SelectorMatchLanguage =  { 
    type: "matchLanguage",
    language: string
} */

/* Transformations Interface */

/* Allows to replace a node (and possibly its entire subtree) with another subtree,
defined by the newNode */
type TransformPatternReplace = {
  kind: "replace";
  newNode: NodeDescription;
  oldChildren: "copy" | "ignore";
  oldProperties: "copy" | "ignore";
};

/* Allows to delete a node and move all its children as children of the same parent node */
export type TransformPatternUnwrap = {
  kind: "unwrap";
  position: "in-place" | "start" | "end"; // Position where the children of the unwrapped node should appear on the children list of the parent
  //oldProperties: "copy" | "ignore",
};

/* Allows to merge two nodes of the same type under one single node of the same type,
 with options for selecting children and properties from both or adding new properties */
export type TransformPatternMergeTwo = {
  kind: "merge";
  oldProperties: "copy-both" | "copy-left" | "copy-right" | "ignore";
  newProperties?: [{ propertyName: string }];
};

/* Allows to split a node into multiple nodes depending on the splitting 
pattern of a single property, defined by propertyName and delimiter */
export type TransformPatternSplitOnProperty = {
  kind: "split-prop";
  newNode: "copy-type" | { language: string; name: string };
  propertyName: string;
  delimiter?: string; // The delimiter to split the string value of the property on. When not defined, the "" is assumed, which splits a string on a per character basis
  otherProperties: "copy" | "ignore";
  oldChildren: "copy" | "ignore";
};

/* Allows to split a node into multiple nodes depending on the children it has.
The delimiter defines a child node to match against, similar to the TransformPatternSplitOnProperty */
export type TransformPatternSplitOnChildren = {
  kind: "split-children";
  newNode: "copy-type" | { Language: string; name: string };
  delimiter?: { language: string; name: string } | NodeDescription; // TODO: Maybe a Selector is better here?
  oldProperties: "copy" | "ignore";
};

export type TransformPattern =
  | TransformPatternReplace
  | TransformPatternUnwrap
  | TransformPatternMergeTwo
  | TransformPatternSplitOnProperty
  | TransformPatternSplitOnChildren;

/* Defining the Patterns and their respective transformations for the regex case*/
