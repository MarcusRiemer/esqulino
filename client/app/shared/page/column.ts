import {
    PageDescription, ColumnDescription, RowDescription
} from './page.description'

export class Column {
    private _width : number;

    constructor(desc : ColumnDescription) {
        this._width = desc.width;
    }
}