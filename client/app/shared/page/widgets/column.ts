import {
    PageDescription, ColumnDescription, RowDescription
} from '../page.description'

import {
    loadWidget, Widget
} from './index'

export {ColumnDescription}

export class Column {
    private _width : number;

    private _widgets : Widget[];

    constructor(desc : ColumnDescription) {
        this._width = desc.width;
        this._widgets = desc.widgets.map( (wiDesc) => loadWidget(wiDesc) );
    }

    /**
     * @return The width of this row
     */
    get width() {
        return (this._width);
    }

    /**
     * @return The widgets for this cell
     */
    get widgets() {
        return (this._widgets);
    }

    /**
     * @return The CSS classes that should be applied when
     *         rendering this column for the editor preview.
     */
    get columnClasses() : [string] {
        return ([`col-md-${this._width}`]);
    }

    toModel() : ColumnDescription {
        return ({
            width : this._width,
            widgets : []
        });
    }
}
