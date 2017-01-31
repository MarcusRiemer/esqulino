import {Parameter}                from './parameter'

/**
 * Represents a number within lower and upper bounds.
 */
export abstract class NumericalParameter extends Parameter {
    private _minValue : number;
    private _maxValue : number;

    constructor(name : string, minValue : number, maxValue : number) {
        super(name);
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
