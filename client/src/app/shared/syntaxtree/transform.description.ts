import { NodeDescription } from "./syntaxtree.description";

/* General Selectors */
// TODO: An ordered property might be a good idea, to allow matching priority to be defined by the user.

export type SelectorType = {
  kind: "type"; // "type" here refers to the nodeType that the selector is targeting.
  language?: string; // Making the language optional allows for general selectors to be used on many different languages
  name?: string; // Making the name optional allows for the any selector, when no name is defined.
  hasChildGroup?: string; // Allows filtering only the defined nodetype based on whether it contains a childgroup or not
};

export type SelectorRoot = {
  kind: "root";
};

export type SelectorNot = {
  kind: "negate";
  selector: Selector;
};

/* Combined Selectors */
export type SelectorImmediateChild = {
  kind: "immediateChild";
  parent: Selector;
  child: Selector;
};

/* TODO:  This might be needed for the merge tansformation, 
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

/* Other Selectors */
// The regexPattern can be used behind the scenes to transform the other properties
// of this selector into a regex and match against it. This also gives the option to
// the user to define a regexPattern directly to match against.
export type SelectorPropertySimple = {
  kind: "property-simple";
  name: string;
  propertyContainsValue?: string;
  propertyValueMinLength?: number;
  propertyValueMaxLength?: number;
};

export type SelectorPropertyRegex = {
  kind: "property-regex";
  name: string;
  regexPattern: string;
};

export type Selector =
  | SelectorType
  | SelectorRoot
  | SelectorNot
  | SelectorImmediateChild
  | SelectorAll
  | SelectorAny
  | SelectorPropertySimple
  | SelectorPropertyRegex;

/* TODO: Is this selector really needed? Why not just match against language? 

export type SelectorMatchLanguage =  { 
    type: "matchLanguage",
    language: string
} */

/* Transformations Interface */

/* Allows to delete a node and move all its children as children of the same parent node */
// NOTE: position: "in-place" is only applicable to the cases where the parent and the
// child share childgroups of the same name. Otherwise it defaults to start.
export type TransformPatternUnwrap = {
  kind: "unwrap";
  position: "in-place" | "start" | "end"; // Position where the children of the unwrapped node should appear on the children list of the parent
  oldProperties: "copy" | "overwrite" | "ignore"; // TODO: Maybe better to replace with append | overwrite | ignore ?
  // NOTE: If we disallow unwrapping for nodes of different types, this might be an irrelevant property.
  //oldChildrenCopyOntoGroup?: string; // Allows for copying all children in the defined childgroup of the parent node.
};

/* Allows to wrap a node as a child of a new Node. */
export type TransformPatternWrapWith = {
  kind: "wrap";
  newNode: NodeDescription;
  appendOntoGroup: string;
};

/* Allows to replace a node (and possibly its entire subtree) with another subtree,
defined by the newNode */
export type TransformPatternReplace = {
  kind: "replace";
  newNode: NodeDescription;
  oldChildren: "copy" | "ignore";
  oldProperties: "copy" | "overwrite" | "ignore";
  oldChildrenAppendOntoGroup?: string; // Can be a be used to copy all children to a specific group under the new node
};

/* Allows to merge two nodes of the same type under one single node of the same type,
 with options for selecting children and properties from both or adding new properties */
export type TransformPatternMergeTwo = {
  kind: "merge";
  oldProperties: "copy-both" | "copy-left" | "copy-right" | "ignore";
  oldChildren: "copy-both" | "copy-left" | "copy-right" | "ignore";
  // newProperties?: [{ propertyName: string }]; // TODO: This might be a bad idea.
};

/* Allows to split a node into multiple nodes depending on the splitting 
pattern of a single property, defined by propertyName and delimiter */
export type TransformPatternSplitOnProperty = {
  kind: "split-property";
  newNodes: "copy-type" | { language: string; name: string };
  propertyName: string;
  delimiter?: string; // The delimiter to split the string value of the property on. When not defined, the "" is assumed, which splits a string on a per character basis
  deleteDelimiter?: boolean; // When False, the delimiter will be appended to the left of every new child
  oldChildren: "copy" | "ignore";
  otherProperties: "copy" | "overwrite" | "ignore";
  wraperNode?: NodeDescription;
  newNodesChildgroup?: string; // Only defined for a user specified wrapper node, to describe under which childGroup name the new children should be appended to.
};

// TODO: Not sure if this is needed | To be implemented later

/* Allows to split a node into multiple nodes depending on the children it has.
The delimiter defines a child node to match against, similar to the TransformPatternSplitOnProperty */
/* export type TransformPatternSplitOnChildren = {
  kind: "split-children";
  newNode: "copy-type" | { language: string; name: string };
  wrapperNode?: NodeDescription;
  childGroupName?: string;
  delimiter?: { language: string; name: string } | NodeDescription; // TODO: Maybe a Selector is better here? When not defined, a per child basis split is assumed.
  deleteDelimiter?: boolean;
  oldProperties: "copy" | "ignore";
}; */

export type TransformPattern =
  | TransformPatternUnwrap
  | TransformPatternWrapWith
  | TransformPatternReplace
  | TransformPatternMergeTwo
  | TransformPatternSplitOnProperty;

export type TransformRule = {
  selector: Selector;
  transformPattern: TransformPattern;
};
