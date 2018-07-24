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

// Uses a parameter that has been formally introduced
export interface ParameterReference {
  "$ref": string
}

// A value that is available under a certain name.
export type ParameterValue = string;

// A set of declared values
export interface ParameterValues {
  [name: string]: ParameterValue;
}