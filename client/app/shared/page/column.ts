import {
    PageDescription, ColumnDescription, RowDescription
} from './page.description'

export class Column {
    private _width : number;

    constructor(desc : ColumnDescription) {
        this._width = desc.width;
    }

    /**
     * @return The width of this row
     */
    get width() {
        return (this._width);
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
