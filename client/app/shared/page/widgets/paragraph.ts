import {Page}                            from '../page'
import {ParagraphDescription}            from '../page.description'
import {Widget, WidgetHost}              from '../hierarchy'

import {WidgetBase, WidgetDescription}   from './widget-base'

export {ParagraphDescription}

/**
 * A text-orientated widget.
 */
export class Paragraph extends WidgetBase {
    private _text : string;
    
    constructor(desc : ParagraphDescription, parent? : WidgetHost) {
        super("paragraph", "widget", false, parent);
        this._text = desc.text;
    }

    /**
     * This describes a "minimal" paragraph
     */
    static get emptyDescription() : ParagraphDescription {
        return ({
            type : "paragraph",
            text : "Absatz"
        })
    }

    get text() {
        return (this._text);
    }

    set text(newText : string) {
        this._text = newText;
        this.fireModelChange();
    }

    protected toModelImpl() : WidgetDescription {
        const toReturn : ParagraphDescription = {
            type : "paragraph",
            text : this._text
        }

        return (toReturn);
    }
}
