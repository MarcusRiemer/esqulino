import * as Ajv from "ajv";

/**
 * The instructions are malformed
 */
export interface ErrorInvalidInstructions {
  type: "InvalidInstructions";
  error: Ajv.ErrorObject;
}

/**
 * A stray value was provided
 */
export interface ErrorValueForUnknownParameter {
  type: "ValueForUnknownParameter";
  name: string;
}

/**
 * A parameter has no bound value at all.
 */
export interface ErrorParameterMissingValue {
  type: "ParameterMissingValue";
  name: string;
}

/**
 * A $ref refers to a parameter name that does not exist
 */
export interface ErrorReferenceToUnknownParameter {
  type: "ReferenceToUnknownParameter";
  name: string;
}

/**
 * An exception occured
 */
export interface ErrorUnexpected {
  type: "Unexpected";
  message: string;
  exception: any;
}

export type GeneratorError =
  | ErrorInvalidInstructions
  | ErrorValueForUnknownParameter
  | ErrorParameterMissingValue
  | ErrorReferenceToUnknownParameter
  | ErrorUnexpected;
