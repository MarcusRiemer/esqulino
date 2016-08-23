import {Page}                            from '../page'
import {EmbeddedHtmlDescription}         from '../page.description'
import {Widget, WidgetHost}              from '../hierarchy'

import {WidgetBase, WidgetDescription}   from './widget-base'

export {EmbeddedHtmlDescription}

/**
 * Experienced users can embed raw HTML into pages. This widget
 * (currently) does absolutly *no checking* whether the given
 * html is valid or not.
 */
export class EmbeddedHtml extends WidgetBase {
    private _html : string;
    
    constructor(desc : EmbeddedHtmlDescription, parent? : WidgetHost) {
        super("embedded-html", "structural", parent);
        this._html = desc.html;
    }

    /**
     * This describes a "minimal" embedded HTML widget (which is empty)
     */
    static get emptyDescription() : EmbeddedHtmlDescription {
        return ({
            type : "embedded-html",
            html : ""
        })
    }

    get html() {
        return (this._html);
    }

    set html(newText : string) {
        this._html = newText;
        this.fireModelChange();
    }

    protected toModelImpl() : WidgetDescription {
        const toReturn : EmbeddedHtmlDescription = {
            type : "embedded-html",
            html : this._html
        }

        return (toReturn);
    }
}
