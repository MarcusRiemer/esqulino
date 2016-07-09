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

    /**
     * @return The level of this heading, always a number.
     */
    get level() : number {
        return (this._level);
    }

    /**
     * 
     *
     * @param newLevel The new level to set.
     */
    set level(newLevel : number) {
        // This is creepy ... The Angular 2 bindings may violate the
        // type system and then pass in a string to this method.
        // In order to ensure we *definetly* have a number in the end,
        // we convert the argument to something that must be a string
        // and read it back.
        this._level = parseInt("" + newLevel);
    }

    get text() {
        return (this._text);
    }

    set text(newText : string) {
        this._text = newText;
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
