import {RowDescription}            from './page.description'
import {Column}                    from './column'

export class Row {
    private _columns : Column[];

    constructor(desc : RowDescription) {
        this._columns = desc.columns.map(columnDesc => new Column(columnDesc));
    }
}
