import {ColumnDescription} from '../page.description'
import {Widget}            from './widget'
import {loadWidget}        from './widget-loader'

export {ColumnDescription}

/**
 * Columns live "inside" a row and act as "table-cells" for content. They
 * usually have no appearance of their and provide nothing but the layout.
 */
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
            widgets : this._widgets.map(w => w.toModel())
        });
    }
}
