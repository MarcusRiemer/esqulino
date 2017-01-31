import {Page, WidgetDescription}         from '../page'
import {BodyDescription}                 from '../page.description'

import {loadWidget}                      from './widget-loader'
import {
    Widget, HostingWidget, WidgetHost, WidgetBase
} from './widget-base'

export {BodyDescription}

/**
 * Rows are the top-level element of most pages.
 */
export class Body extends HostingWidget {
    private _children : Widget[]  = [];

    private _page : Page;
    
    constructor(desc : BodyDescription, page : Page) {
        super({type: "body", category: "layout", isEmpty: false }, undefined);

        this._page = page;
        
        // Create all referenced columns
        this._children = desc.children.map(wiDesc => loadWidget(wiDesc, this));

        
    }

    get page() : Page {
        return (this._page);
    }

    /**
     * A description for an empty body.
     */
    static get emptyDescription() : BodyDescription {
        return ({
            type : "body",
            children : []
        });
    }

    /**
     * The body accepts everything that isn't a column.
     */
    acceptsWidget(desc : WidgetDescription) : boolean {
        return (desc.type !== "column");
    }

    /**
     * @return All columns that are part of this row
     */
    get children() {
        return (this._children);
    }

    protected toModelImpl() : BodyDescription {
        return ({
            type : "body",
            children : this.children.map(c => c.toModel())
        });
    }
}
