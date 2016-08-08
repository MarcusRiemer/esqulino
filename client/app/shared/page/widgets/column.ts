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
        this._widgets = desc.widgets.map( (wiDesc) => loadWidget(wiDesc, parent) );
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
     * Adds a new widget at the given position.
     *
     * @param widget The widget to add
     * @param widgetIndex The index the widget is positioned at
     *
     * @return The instance of the loaded widget
     */
    addWidget(widgetDesc : WidgetDescription, widgetIndex : number) {
        // Ensure widget index at least touches the current array
        if (widgetIndex != 0 && widgetIndex > this._widgets.length) {
            throw new Error(`Adding Widget ("${JSON.stringify(widgetDesc)}") exceeds widget count (given: ${widgetIndex}, length ${this._widgets.length}`);
        }

        const widget = loadWidget(widgetDesc, this.page);
        this._widgets.splice(widgetIndex, 0, widget);

        return (widget);
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
