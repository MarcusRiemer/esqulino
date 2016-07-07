import {Widget, WidgetDescription} from './widget'
import {ParagraphDescription}      from '../page.description'

export {ParagraphDescription}

/**
 * A text-orientated widget.
 */
export class Paragraph extends Widget {
    private _text : string;
    
    constructor(desc : ParagraphDescription) {
        super("paragraph");
        this._text = desc.text;
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
