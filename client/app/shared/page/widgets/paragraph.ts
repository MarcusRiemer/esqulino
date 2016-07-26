import {Page}                            from '../page'
import {ParagraphDescription}            from '../page.description'

import {Widget, WidgetDescription}       from './widget'

export {ParagraphDescription}

/**
 * A text-orientated widget.
 */
export class Paragraph extends Widget {
    private _text : string;
    
    constructor(desc : ParagraphDescription, page? : Page) {
        super("paragraph", page);
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
    }

    protected toModelImpl() : WidgetDescription {
        const toReturn : ParagraphDescription = {
            type : "paragraph",
            text : this._text
        }

        return (toReturn);
    }
}
