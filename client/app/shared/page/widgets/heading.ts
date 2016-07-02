import {Widget, WidgetDescription} from './widget'
import {HeadingDescription}       from '../page.description'

export {HeadingDescription}

/**
 * A heading.
 */
export class Heading extends Widget {
    private _text : string;
    private _level : number;
    
    constructor(desc : HeadingDescription) {
        super("heading");
        this._text = desc.text;
        this._level = desc.level;
    }

    get level() {
        return (this._level);
    }

    get text() {
        return (this._text);
    }

    protected toModelImpl() : WidgetDescription {
        const toReturn : HeadingDescription = {
            type : "heading",
            level : this._level,
            text : this._text
        }

        return (toReturn);
    }
}
