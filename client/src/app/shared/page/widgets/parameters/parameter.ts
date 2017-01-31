/**
 * Deriving classes provide metadata on how widgets could be
 * parametrized.
 */
export abstract class Parameter {
    private _name : string;

    constructor(name : string) {
        this._name = name;
    }

    get name() {
        return (this._name);
    }
}
