import {PageDescription}           from './page.description'

export class Page {
    private _id : string;
    private _name : string;
    
    constructor(desc : PageDescription) {
        this._id = desc.id;
        this._name = desc.name;
    }

    get name() {
        return (this._name);
    }

    get id() {
        return (this._id);
    }
}
