import { QualifiedTypeName } from './syntaxtree'

/**
 * This is the basic description to introduce a new type for
 * any kind of node. If you are familiar with schema languages
 * like XML-Schema, JSON-Schema, NG-Relax, ... this will be
 * (hopefully) nothing too surprising for you.
 *
 * This schema language is modeled losely after XML-Schema,
 * but enhanced by various UI-related features.
 * 
 * Nodes can define two different sets of related data. But only
 * complex nodes are allowed to have children that are nodes
 * themselves.
 *
 * The restriction system for simple properites is modelled after
 * facets in XML-Schema: https://www.w3.org/TR/xmlschema-2/#defn-coss
 *
 * Builtin types are:
 * - String
 * - Integer
 *
 * Notable Enhancements are:
 * - Types may define children in different categories. For
 *   XML this may be "children" and "attributes", but these
 *   are mainly used for layouting purposes in the editor
 *   display.
 */
export interface NodeTypeDescription {
  children?: { [name: string]: NodeTypeChildrenGroupDescription }
  properties?: { [name: string]: NodePropertyTypeDescription }
}

export type NodePropertyTypeDescription =
  NodePropertyStringDescription
  | NodePropertyIntegerDescription
  | NodePropertyBooleanDescription;

export type NodeTypeChildrenGroupDescription = NodeTypesAllowedDescription | NodeTypesSequenceDescription;

export function isQualifiedTypeName(arg: any): arg is QualifiedTypeName {
  return (arg.typeName && arg.languageName);
}

/**
 * Simple strings are used to refer to local types
 */
export type TypeReference = QualifiedTypeName | string

/**
 * 
 */
export interface NodePropertyDescription {
  base: string
}

/**
 * Denotes a "boolean" type.
 */
export interface NodePropertyBooleanDescription {
  base: "boolean"
}

/**
 * Denotes the "string" type and describes ways it can be further restricted.
 */
export interface NodePropertyStringDescription extends NodePropertyDescription {
  base: "string"
  restrictions?: NodeStringTypeRestrictions[]
}

/**
 * The restrictions that are applicable to strings
 */
export type NodeStringTypeRestrictions = LengthRestrictionDescription
  | MinimumLengthRestrictionDescription
  | MaximumLengthRestrictionDescription

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
 * The restrictions that are applicable to integers
 */
type NodeIntegerTypeRestrictions = MinInclusiveRestriction
  | MaxInclusiveRestriction

/**
 * Describes the "Integer" type and describes how it can be restricted.
 */
export interface NodePropertyIntegerDescription extends NodePropertyDescription {
  base: "integer"
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
 * In a sequence every child must occur in exact the order and cardinality
 * that is specified by this description.
 */
export interface NodeTypesSequenceDescription {
  type: "sequence"
  nodeTypes: TypeReference[]
}

/**
 * Every immediate child must be part of this list of allowed types.
 */
export interface NodeTypesAllowedDescription {
  type: "allowed"
  nodeTypes: TypeReference[]
}

/**
 * Describes a whole schema that in turn may describe a whole language.
 */
export class LanguageDescription {
  // The unique name of the language
  languageName: string

  // All types that exist in this language
  types: { [nodeName: string]: NodeTypeDescription }

  // Types that, per default, can be used at the root of syntax trees
  root: TypeReference[]
}

/**
 * @return True, if the given instance probably satisfies "NodeTypesAllowedDescription"
 */
export function isNodeTypesAllowedDescription(obj: any): obj is NodeTypesAllowedDescription {
  return (obj.type === "allowed");
}

/**
 * @return True, if the given instance probably satisfies "NodeTypesSequenceDescription"
 */
export function isNodeTypesSequenceDescription(obj: any): obj is NodeTypesSequenceDescription {
  return (obj.type === "sequence");
}

/**
 * @return True, if the given instance probably satisfies "NodePropertyStringDescription"
 */
export function isNodePropertyStringDesciption(obj: any): obj is NodePropertyStringDescription {
  return (obj.base === "string");
}

/**
 * @return True, if the given instance probably satisfies "NodePropertyBooleanDescription"
 */
export function isNodePropertyBooleanDesciption(obj: any): obj is NodePropertyBooleanDescription {
  return (obj.base === "boolean");
}
