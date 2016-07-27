import {Page, RowDescription}      from '../page'

import {Column}                    from './column'
import {Widget}                    from './widget'

export {RowDescription}

/**
 * Rows are the top-level element of most pages.
 */
export class Row {
    private _columns : Column[];

    private _page : Page;

    constructor(desc : RowDescription, page? : Page) {
        this._page = page;
        
        // Create all referenced columns
        this._columns = desc.columns.map(columnDesc => new Column(columnDesc, page));
    }

    /**
     * A description for a row that is empty. This currently defaults to a row
     * with a column that spans the whole row.
     */
    static get emptyDescription() : RowDescription {
        return ({
            columns : [{
                widgets : [],
                width : 12
            }]
        });
    }

    /**
     * @return All columns that are part of this row
     */
    get columns() {
        return (this._columns);
    }

    /**
     * @return All widgets across all columns.
     */
    get widgets() : Widget[] {
        const subs = this._columns.map(c => c.widgets);
        return ([].concat(...subs));
    }

    toModel() : RowDescription {
        return ({
            columns : this._columns.map(c => c.toModel())
        });
    }
}
