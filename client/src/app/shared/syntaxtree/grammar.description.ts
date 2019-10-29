import { QualifiedTypeName } from './syntaxtree.description'
import { OccursDescription } from './occurs.description';

/**
 * Types may either be concrete new type or an alias
 * grouping together multiple other types.
 */
export type NodeTypeDescription = NodeConcreteTypeDescription | NodeOneOfTypeDescription;

/**
 * Creates a possibility to define multiple NodeTypes as alternatives
 * to each other *without* introducing an artificial node type. This
 * is helpful for e.g. the root node or when using recursive definitions.
 */
export interface NodeOneOfTypeDescription {
  type: "oneOf";
  oneOf: TypeReference[];
}

/**
 * This is the basic description to introduce a new type for
 * any kind of node. If you are familiar with schema languages
 * like XML-Schema, JSON-Schema, NG-Relax, ... this will be
 * (hopefully) nothing too surprising for you.
 *
 * This schema language is modeled losely after XML-Schema,
 * but enhanced with various UI-related features.
 *
 * The restriction system for simple properties is modelled after
 * facets in XML-Schema: https://www.w3.org/TR/xmlschema-2/#defn-coss
 *
 * Builtin types are:
 * - String
 * - Integer
 * - Boolean
 *
 * The restriction system for child nodes is also modelled losely
 * after XML schemas complex element types. An important deviation
 * is that child nodes can be distribibuted in multiple groups. This
 * means that a single node can be parent to two unrelated sub-trees.
 * XML schema in contrast allows exactly nodes and attributes as
 * sub-trees.
 *
 * The actual attributes of this node (properties or children) are stored
 * as a list because the order does matter during string serialization
 * or automatic UI generation. And whilst syntactic terminal symbols are
 * not actually required at all when validating a tree, they are meaningful
 * for the automation process.
 *
 * Over time the grammar structure has deviated from being "validation
 * only", it now also contains visual information about the row layout of
 * the text based representation.
 */
export interface NodeConcreteTypeDescription {
  type: "concrete";
  attributes?: NodeAttributeDescription[];
}

/**
 * Attributes of a node are either validation atoms like properties
 * or children or visual cues like terminals or rows.
 */
export type NodeAttributeDescription =
  NodePropertyTypeDescription
  | NodeChildrenGroupDescription
  | NodeTerminalSymbolDescription
  | NodeRowDescription;

/**
 * A terminal symbol that would be expected.
 */
export interface NodeTerminalSymbolDescription {
  type: "terminal";
  name: string;
  symbol: string;
}

/**
 *
 */
export interface NodeRowDescription {
  type: "row";
  name: string;
  orientation: "horizontal" | "vertical";
  children: NodeAttributeDescription[];
}

/**
 * Properties are used for atomic values and may be optional.
 */
export type NodePropertyTypeDescription =
  NodePropertyBooleanDescription |
  NodePropertyIntegerDescription |
  NodePropertyStringDescription;

/**
 * Simple strings are used to refer to local types that share the
 * same language name.
 */
export type TypeReference = QualifiedTypeName | string

/**
 * Denotes a "boolean" type.
 */
export interface NodePropertyBooleanDescription {
  type: "property"
  name: string
  base: "boolean"
  isOptional?: boolean
}

/**
 * Denotes the "string" type and describes ways it can be further restricted.
 */
export interface NodePropertyStringDescription {
  type: "property"
  name: string
  base: "string"
  isOptional?: boolean
  restrictions?: NodeStringTypeRestrictions[]
}

/**
 * The restrictions that are applicable to strings
 */
export type NodeStringTypeRestrictions =
  LengthRestrictionDescription
  | MinimumLengthRestrictionDescription
  | MaximumLengthRestrictionDescription
  | EnumRestrictionDescription
  | RegularExpressionRestrictionDescription

/**
 * Restricts the minimum length of things.
 */
export interface MinimumLengthRestrictionDescription {
  type: "minLength"
  value: number
}

/**
 * Restricts the maximum length of things.
 */
export interface MaximumLengthRestrictionDescription {
  type: "maxLength"
  value: number
}

/**
 * Restricts the maximum length of things.
 */
export interface LengthRestrictionDescription {
  type: "length"
  value: number
}

/**
 * Restricts a string to be one of a given set of values
 */
export interface EnumRestrictionDescription {
  type: "enum",
  value: string[]
}

/**
 * Restricts to match a regular expression
 */
export interface RegularExpressionRestrictionDescription {
  type: "regex",
  value: string
}

/**
 * The restrictions that are applicable to integers
 */
export type NodeIntegerTypeRestrictions = MinInclusiveRestriction
  | MaxInclusiveRestriction

/**
 * Describes the "Integer" type and describes how it can be restricted.
 */
export interface NodePropertyIntegerDescription {
  type: "property"
  name: string
  base: "integer"
  isOptional?: boolean,
  restrictions?: NodeIntegerTypeRestrictions[]
}

/**
 * Restricts the maximum numerical value.
 */
export interface MaxInclusiveRestriction {
  type: "maxInclusive"
  value: number
}

/**
 * Restricts the minimum numerical value.
 */
export interface MinInclusiveRestriction {
  type: "minInclusive"
  value: number
}

/**
 * Describes how often a certain type may appear in a sequence.
 */
export interface ChildCardinalityDescription {
  nodeType: TypeReference
  occurs: OccursDescription
}

/**
 * A simple type reference is a shortcut for an element with
 * minOccurs = 1 and maxOccurs = 1;
 */
export type NodeTypesChildReference = (TypeReference | ChildCardinalityDescription);

/**
 * In a sequence every child must occur in exact the order and cardinality
 * that is specified by this description.
 */
export interface NodeTypesSequenceDescription {
  type: "sequence"
  name: string
  nodeTypes: NodeTypesChildReference[]
  between?: NodeTerminalSymbolDescription
}

/**
 * Every immediate child must be part of this list of allowed types. The order
 * in which these children appear in is not relevant.
 */
export interface NodeTypesAllowedDescription {
  type: "allowed",
  name: string,
  nodeTypes: NodeTypesChildReference[],
  between?: NodeTerminalSymbolDescription
}

/**
 * Tries the given operators in the order they appear in. If any of them is
 * satisfied, the child group is considered valid.
 */
export interface NodeTypesChoiceDescription {
  type: "choice",
  name: string,
  choices: TypeReference[]
}

/**
 * Allows to group different children together and to
 * apply a cardinality to them. Mixing different child group semantics is explicitly
 * forbidden, each group may be either nothing but "allowed" or nothing but "sequence"
 * combinators.
 */
export interface NodeTypesParenthesesDescription {
  type: "parentheses",
  name: string,
  group: {
    type: "sequence" | "allowed",
    nodeTypes: NodeTypesChildReference[]
  },
  cardinality: OccursDescription,
  between?: NodeTerminalSymbolDescription
}

/**
 * All children group types that are available
 */
export type NodeChildrenGroupDescription =
  NodeTypesSequenceDescription
  | NodeTypesAllowedDescription
  | NodeTypesChoiceDescription
  | NodeTypesParenthesesDescription;

/**
 * Listing data about grammars
 */
export interface GrammarListDescription {
  // The unique ID of this language
  id: string

  // The name of the language
  name: string

  // The name of the programming language this grammar implements
  programmingLanguageId: string

  // The possible slug for URL usage
  slug?: string
}

/**
 * Types for a single language
 */
export type NamedTypes = { [nodeName: string]: NodeTypeDescription };

/**
 * Multiple languages with types
 */
export type NamedLanguages = { [languageName: string]: NamedTypes };

/**
 * This part of the grammar is stored as a JSON blob in the database.
 */
export interface GrammarDatabaseBlob {
  // All types that are defined on this language
  types: NamedLanguages

  // All types that come from different languages
  foreignTypes?: NamedLanguages

  // The type that needs to be at the root of the language.
  root: QualifiedTypeName
}

/**
 * The technical aspects of a grammar that are used for actual validation
 * or generation.
 */
export interface GrammarDocument extends GrammarDatabaseBlob {
  // These grammars are included in this grammar
  includedGrammars?: string[]
}

/**
 * A whole grammar with all user-facing documentation.
 */
export interface GrammarDescription extends GrammarDocument, GrammarListDescription {

}

/**
 * @return True if the given instance satisfies "QualifiedTypeName"
 */
export function isQualifiedTypeName(arg: any): arg is QualifiedTypeName {
  return (arg instanceof Object && arg.typeName && arg.languageName);
}

/**
 * @return True if the given instance satisfies "NodeConcreteTypeDescription"
 */
export function isNodeConcreteTypeDescription(arg: any): arg is NodeConcreteTypeDescription {
  return (arg instanceof Object && !arg.oneOf);
}

/**
 * @return True if the given instance satisfies "NodeConcreteTypeDescription"
 */
export function isNodeOneOfTypeDescription(arg: any): arg is NodeOneOfTypeDescription {
  return (arg instanceof Object && arg.oneOf instanceof Array);
}

/**
 * @return True if the given instance probably satisfies "NodeTypesAllowedDescription"
 */
export function isNodeTypesAllowedDescription(obj: any): obj is NodeTypesAllowedDescription {
  return (obj instanceof Object && obj.type === "allowed");
}

/**
 * @return True, if the given instance probably satisfies "NodeTypesSequenceDescription"
 */
export function isNodeTypesSequenceDescription(obj: any): obj is NodeTypesSequenceDescription {
  return (obj instanceof Object && obj.type === "sequence");
}

/**
 * @return True, if the given instance probably satisfies "ChildCardinalityDescription"
 */
export function isChildCardinalityDescription(obj: any): obj is ChildCardinalityDescription {
  return (obj instanceof Object && "occurs" in obj && "nodeType" in obj);
}

/**
 * @return True, if the given instance probably satisfies "NodePropertyStringDescription"
 */
export function isNodePropertyStringDesciption(obj: any): obj is NodePropertyStringDescription {
  return (obj instanceof Object && obj.base === "string");
}

/**
 * @return True, if the given instance probably satisfies "NodePropertyBooleanDescription"
 */
export function isNodePropertyBooleanDesciption(obj: any): obj is NodePropertyBooleanDescription {
  return (obj instanceof Object && obj.base === "boolean");
}

/**
 * @return True, if the given instance probably satisfies "NodePropertyIntegerDescription"
 */
export function isNodePropertyIntegerDesciption(obj: any): obj is NodePropertyBooleanDescription {
  return (obj instanceof Object && obj.base === "integer");
}