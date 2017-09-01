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
 * Notable Enhancements are:
 * - Types may define children in different categories. For
 *   XML this may be "children" and "attributes", but these
 *   are mainly used for layouting purposes in the editor
 *   display.
 */
export interface NodeTypeDescription {
  type: "simple" | "complex"
  nodeName: string
}

/**
 * A simple type may only have a single property that could be
 * interpreted as a string. Depending on the base type certain
 * additional restrictions may be applied.
 *
 * The restriction system is modelled after facets in XML-Schema:
 * https://www.w3.org/TR/xmlschema-2/#defn-coss
 *
 * Builtin types are:
 * - String
 * - Integer
 */
export interface NodeSimpleTypeDescription extends NodeTypeDescription {
  type: "simple"
}

/**
 * Denotes the "string" type and describes ways it can be further restricted.
 */
export interface NodeStringTypeDescription extends NodeSimpleTypeDescription {
  base: "string"
  restrictions: NodeStringTypeRestrictions[]
}

/**
 * The restrictions that are applicable to strings
 */
type NodeStringTypeRestrictions = LengthRestrictionDescription
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
export interface NodeIntegerTypeDescription extends NodeSimpleTypeDescription {
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
 * A complex type may have all kinds of children. These children can 
 * occur in different groups.
 */
export interface NodeComplexTypeDescription extends NodeTypeDescription {
  type: "complex"
  chidlrenCategories?: NodeComplexTypeChildrenGroupDescription[]
  propertyCategories?: NodeComplexTypePropertiesGroupDescription[]
}

export interface NodeComplexTypePropertiesGroupDescription {
  categoryName: string
  properties: (NodeStringTypeDescription | NodeIntegerTypeDescription)[]
}

/**
 * Defines a group which allows different types of children.
 */
export interface NodeComplexTypeChildrenGroupDescription {
  categoryName: string
  children: NodeTypesAllowedDescription | NodeTypesSequenceDescription
}

/**
 * In a sequence every child must occur in exact the order that is
 * specified by this description.
 */
export interface NodeTypesSequenceDescription {
  type: "sequence"
  nodeTypes: string[]
}

export interface NodeTypesAllowedDescription {
  type: "allowed"
  nodeTypes: string[]
}

/**
 * Used when refererring to types that are defined other languages.
 */
export interface QualifiedTypeReference {
  typeName: string
  languageName: string
}

export function isQualifiedTypeReference(arg: any): arg is QualifiedTypeReference {
  return (arg.typeName && arg.languageName);
}

/**
 * Simple strings are used to refer to local types
 */
export type TypeReference = QualifiedTypeReference | string

/**
 * Describes a whole schema that in turn may describe a whole language.
 */
export class LanguageDescription {
  languageName: string

  types: NodeTypeDescription[]

  root: TypeReference[]
}


