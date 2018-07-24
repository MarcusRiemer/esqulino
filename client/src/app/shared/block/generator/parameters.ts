import * as Desc from './parameters.description'
import { ParameterValue } from './parameters.description';

// Function with this signature may be used
export type ValidationFunction = (
  expectedType: Desc.ParameterType,
  value: Desc.ParameterValue
) => boolean;

export const ValidatorFunctions: { [name: string]: ValidationFunction } = {
  "string": (expectedType, value) => {
    return (true)
  }
}

export interface ParameterErrorUnknown {
  "type": "UnknownParameter"
  "name": string
}

export interface ParameterErrorMissingValue {
  "type": "MissingValue"
  "name": string
}

export type ParameterError = ParameterErrorUnknown | ParameterErrorMissingValue

// Manages the state of parameters
export class ParameterMap {
  // All parameters that would be meaningful in this context
  private _knownParameters: Desc.ParameterDeclarations = {};

  // All values that are currently stored
  private _currentValues: { [name: string]: Desc.ParameterValue } = {};

  constructor() {

  }

  /**
   * Make the given parameters known to this map.
   */
  addParameters(params: Desc.ParameterDeclarations) {
    Object.entries(params).forEach(([name, param]) => {
      // Is this a parametername that has already been taken?
      const existing = this._knownParameters[name];
      if (existing) {
        // TODO: Instead of throwing an error directly one could possibly check
        // whether the re-declaration actually differs.
        throw new Error(`Parameter "${name}" has been declared before: ${JSON.stringify(existing)}`);
      } else {
        // Newly introduced, lets store a copy of it
        this._knownParameters[name] = Object.assign({}, param);
      }
    });
  }

  /**
   * Make additional values known
   */
  addValues(values: Desc.ParameterValues) {
    this._currentValues = Object.assign(this._currentValues, values);
  }

  validate(): ParameterError[] {
    const toReturn: ParameterError[] = [];

    // Go through every parameter to ensure its satisfied
    Object.entries(this._knownParameters).forEach(([name, param]) => {
      // Is there a value for this parameter?
      if (!this._currentValues[name]) {
        // No, that is a problem
        toReturn.push({
          type: "MissingValue",
          name: name
        });
      } else {
        // Yes, lets see whether it is valid
        const value = this._currentValues[name];
      }
    });

    // Go through every value to ensure there is a corresponding parameter
    Object.entries(this._currentValues).forEach(([name, value]) => {
      if (!this._knownParameters[name]) {
        toReturn.push({
          type: "UnknownParameter",
          name: name
        });
      }
    });

    return (toReturn);
  }

  /**
   * @return The value that is saved under the given name.
   */
  getValue(name: string): ParameterValue {
    if (name in this._currentValues) {
      return (this._currentValues[name]);
    }
  }
}