import {
    PageDescription, ColumnDescription, RowDescription
} from './page.description'

export class Column {
    private _width : number;

    constructor(desc : ColumnDescription) {
        this._width = desc.width;
    }

    get width() {
        return (this._width);
    }

    get columnClasses() : [string] {
        return ([`col-md-${this._width}`]);
    }
}
