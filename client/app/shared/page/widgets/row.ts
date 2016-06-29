import {RowDescription}            from '../page.description'

import {Column}                    from './column'

export {RowDescription}

/**
 * Rows are the top-level element of most pages.
 */
export class Row {
    private _columns : Column[];

    constructor(desc : RowDescription) {
        // Create all referenced columns
        this._columns = desc.columns.map(columnDesc => new Column(columnDesc));
    }

    /**
     * @return All columns that are part of this row
     */
    get columns() {
        return (this._columns);
    }

    toModel() : RowDescription {
        return ({
            columns : this._columns.map(c => c.toModel())
        });
    }
}
