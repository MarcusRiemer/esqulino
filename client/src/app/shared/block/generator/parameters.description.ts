export interface ParameterTypeString {
  "type": "string"
}

export interface ParameterTypeColor {
  "type": "color"
}

export interface ParameterBoolean {
  "type": "boolean"
}

// Defines the possible types for parameters
export type ParameterType = ParameterTypeString | ParameterBoolean | ParameterTypeColor

// Definition of a single parameter
export interface ParameterDeclaration {
  type: ParameterType;
  defaultValue?: ParameterValue;
}

// Declares that a certain names should be available to be referenced
export interface ParameterDeclarations {
  [name: string]: ParameterDeclaration;
}

// Resolves a value at runtime. The value must be the name of a parameter
// that has been formally introduced before.
export interface ParameterReference {
  $ref: string
}

// Checks for the "$ref" property
export function isParameterReference(obj: any): obj is ParameterReference {
  return (typeof (obj) === "object" && "$ref" in obj);
}

// All types that are considered primitive in Javascript.
// It seems that there is no builtin for this kind of distinction.
//
// symbol is missing on this list because the schema generator chokes on it
type PrimitiveType = string | number | boolean | undefined | null;

// Allows properties of an object to be a reference that can be resolved to
// an actual value later.
export type ParameterReferenceable<T> = {
  [P in keyof T]: T[P] extends PrimitiveType
  ? (T[P] | ParameterReference)
  : T[P] | ParameterReferenceable<T[P]>
}

// A value that is available under a certain name.
export type ParameterValue = string | boolean;

// A set of declared values
export interface ParameterValues {
  [name: string]: ParameterValue;
}
