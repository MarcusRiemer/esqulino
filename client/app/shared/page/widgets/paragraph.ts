import {Widget}                    from './widget'
import {ParagraphDescription}      from '../page.description'

export {ParagraphDescription}

export class Paragraph extends Widget {
    private _text : string;
    
    constructor(desc : ParagraphDescription) {
        super("paragraph");
        this._text = desc.text;
    }

    get text() {
        return (this._text);
    }
}
