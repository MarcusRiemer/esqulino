export interface ParameterTypeString {
  "type": "string"
}

// Defines the possible types for parameters
export type ParameterType = ParameterTypeString

// Definition of a single parameter
export interface ParameterDeclaration {
  type: ParameterType;
}

// Declares that a certain names should be available to be referenced
export interface ParameterDeclarations {
  [name: string]: ParameterDeclaration;
}

// Resolves a value at runtime. The value must be the name of a parameter
// that has been formally introduced before.
export interface ParameterReference {
  "$ref": string
}

// Allows properties of an object to be optional and to be
// a reference that can be resolved to an actual value later.
export type ParameterReferenceable<T> = {
  [P in keyof T]?: T[P] | ParameterReference;
}

export function isParameterReference(obj: any): obj is ParameterReference {
  return (typeof (obj) === "object" && "$ref" in obj);
}

// A value that is available under a certain name.
export type ParameterValue = string;

// A set of declared values
export interface ParameterValues {
  [name: string]: ParameterValue;
}