export interface ParameterDefinition {
    name : string
    getter : () => any
    setter : (val : any) => void
}

/**
 * Deriving classes provide metadata on how widgets could be
 * parametrized.
 */
export abstract class Parameter {
    private _name : string;
    private _getter : () => any;
    private _setter : (val : any) => void;

    constructor(def : ParameterDefinition) {
        this._name = def.name;
        this._getter = def.getter;
        this._setter = def.setter;
    }

    /**
     * The internal name of this property
     */
    get name() {
        return (this._name);
    }

    get value() {
        return (this._getter());
    }

    get inputSize() {
        const length = this.value.toString().length;
        return (Math.max(length, 1));
    }

    set value(val : any) {
        this._setter(val);
    }
}
