import {PageDescription}          from './page.description'
import {Row}                      from './row'

/**
 * The in-memory representation of a page.
 */
export class Page {
    private _id : string;
    private _name : string;
    private _rows : Row[];
    
    constructor(desc : PageDescription) {
        this._id = desc.id;
        this._name = desc.name;

        this._rows = desc.rows.map(rowDesc => new Row(rowDesc));
    }

    get name() {
        return (this._name);
    }

    get id() {
        return (this._id);
    }
}
