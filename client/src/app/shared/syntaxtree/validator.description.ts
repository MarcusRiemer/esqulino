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
 * is that child nodes can appear in multiple groups. This means 
 * that a single node can be parent to two unrelated sub-trees.
 * XML schema in contrast allows exactly nodes and attributes as
 * sub-trees.
 */
export interface NodeTypeDescription {
  children?: { [name: string]: NodeTypeChildrenGroupDescription }
  properties?: { [name: string]: NodePropertyTypeDescription }
}

/**
 * All property types that are available.
 */
export type NodePropertyTypeDescription =
  NodePropertyStringDescription
  | NodePropertyIntegerDescription
  | NodePropertyBooleanDescription;

/**
 * All children group types that are available
 */
export type NodeTypeChildrenGroupDescription =
  NodeTypesAllowedDescription
  | NodeTypesSequenceDescription;

export function isQualifiedTypeName(arg: any): arg is QualifiedTypeName {
  return (arg.typeName && arg.languageName);
}

/**
 * Simple strings are used to refer to local types that share the
 * same language name.
 */
export type TypeReference = QualifiedTypeName | string

/**
 * Denotes a "boolean" type.
 */
export interface NodePropertyBooleanDescription {
  base: "boolean"
}

/**
 * Denotes the "string" type and describes ways it can be further restricted.
 */
export interface NodePropertyStringDescription {
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
export interface NodePropertyIntegerDescription {
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
 * Describes how often a certain type may appear in a sequence.
 */
export interface ChildCardinalityDescription {
  nodeType: TypeReference
  minOccurs: number
  maxOccurs: number
}

/**
 * Describes limits for occurences.
 */
export interface OccursDescription {
  minOccurs: number
  maxOccurs: number
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
  nodeTypes: NodeTypesChildReference[]
}

/**
 * Every immediate child must be part of this list of allowed types.
 */
export interface NodeTypesAllowedDescription {
  type: "allowed"
  nodeTypes: NodeTypesChildReference[]
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
  return (obj instanceof Object && obj.type === "allowed");
}

/**
 * @return True, if the given instance probably satisfies "NodeTypesSequenceDescription"
 */
export function isNodeTypesSequenceDescription(obj: any): obj is NodeTypesSequenceDescription {
  return (obj instanceof Object && obj.type === "sequence");
}

/**
 * @return True, if the given instance probably satisfies "SequenceCardinalityDescription"
 */
export function isChildCardinalityDescription(obj: any): obj is ChildCardinalityDescription {
  return (obj instanceof Object && "minOccurs" in obj && "maxOccurs" in obj && "nodeType" in obj);
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
