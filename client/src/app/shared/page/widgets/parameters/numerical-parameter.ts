import { Parameter, ParameterDefinition } from './parameter'

/**
 * Represents a number within lower and upper bounds.
 */
export class NumericalParameter extends Parameter {
  private _minValue: number;
  private _maxValue: number;

  constructor(def: ParameterDefinition, minValue: number, maxValue: number) {
    super(def);
    this._minValue = minValue;
    this._maxValue = maxValue;
  }

  get minValue() {
    return (this._minValue);
  }

  get maxValue() {
    return (this._maxValue);
  }
}
