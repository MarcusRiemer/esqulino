/**
 *
 */
export interface ErrorValueForUnknownParameter {
  "type": "ValueForUnknownParameter"
  "name": string
}

export interface ErrorParameterMissingValue {
  "type": "ParameterMissingValue"
  "name": string
}

export interface ErrorReferenceToUnknownParameter {
  "type": "ReferenceToUnknownParameter"
  "name": string
}

export interface ErrorUnexpected {
  "type": "Unexpected",
  "message": string;
  "exception": any;
}

export type GeneratorError = ErrorValueForUnknownParameter | ErrorParameterMissingValue | ErrorReferenceToUnknownParameter | ErrorUnexpected;