import {Page, ColumnDescription}        from '../page'

import {loadWidget}                     from './widget-loader'
import {
    WidgetBase, WidgetDescription, HostingWidget, WidgetHost
}  from './widget-base'

export {ColumnDescription}

/**
 * Columns live "inside" a row and act as "table-cells" for content. They
 * usually have no appearance of their and provide nothing but the layout.
 */
export class Column extends HostingWidget {
    private _width : number;

    private _widgets : WidgetBase[];

    constructor(desc : ColumnDescription, parent? : WidgetHost) {
        super("column", parent);
        
        this._width = desc.width;
        this._widgets = desc.widgets.map( (wiDesc) => loadWidget(wiDesc, this) );
    }

    static get emptyDescription() : ColumnDescription {
        return ({
            type : "column",
            widgets : [],
            width : 12
        });
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
    get children() {
        return (this._widgets);
    }

    /**
     * Accepts anything that isn't a column itself.
     */
    acceptsWidget(desc : WidgetDescription) : boolean {
        return (desc.type != this.type);
    }

    /**
     * @return The CSS classes that should be applied when
     *         rendering this column for the editor preview.
     */
    get columnClasses() : [string] {
        return ([`col-md-${this._width}`]);
    }

    protected toModelImpl() : ColumnDescription {
        return ({
            type : "column",
            width : this._width,
            widgets : this._widgets.map(w => w.toModel())
        });
    }
}
