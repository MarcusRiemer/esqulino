import {Widget}                    from '../widget'
import {ParagraphDescription}      from '../page.description'

export class Paragraph extends Widget {
    private _text : string;
    
    constructor(desc : ParagraphDescription) {
        super();
        this._text = desc.text;
    }
}
