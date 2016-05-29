import {WidgetDescription}          from '../page.description'

/**
 * Something that can be used to create a page.
 */
export abstract class Widget {
    private _type : string;

    constructor(type : string) {
        this._type = type;
    }

    get type() : string {
        return (this._type);
    }
}
